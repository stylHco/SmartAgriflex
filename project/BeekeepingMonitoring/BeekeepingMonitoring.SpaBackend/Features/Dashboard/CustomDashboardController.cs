using System.Collections.Generic;
using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Features.CustomRules;
using BeekeepingMonitoring.SpaBackend.Features.Devices;
using BeekeepingMonitoring.SpaBackend.Features.SensorDeviceDatas;
using BeekeepingMonitoring.SpaBackend.Features.SensorDevices;
using BeekeepingMonitoring.SpaBackend.Features.Sensors;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;
using NodaTime;

namespace BeekeepingMonitoring.SpaBackend.Features.Dashboard;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/custom-dashboards")]
[Authorize]
[AutoConstructor]
public partial class CustomDashboardController : ControllerBase
{
// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region SharesFunctionsAndViriables

    private readonly ApplicationDbContext _dbContext;

    public enum DashboardSensorTypeEnum
    {
        Temperature = 0,
        Humidity = 1,
        WindSpeed = 2,
        WindDirection = 3,
        Light = 4,
    }

    public enum DashboardIntervalTypeEnum
    {
        Hourly = 0,
        Daily = 1,
        Weekly = 2,
        Monthly = 3,
        Yearly = 4,
    }

    string GetSensorTypeName(DashboardSensorTypeEnum dashboardSensorTypeEnum)
    {
        switch (dashboardSensorTypeEnum)
        {
            case DashboardSensorTypeEnum.Temperature:
                return "temperature";
            case DashboardSensorTypeEnum.Humidity:
                return "humidity";
            case DashboardSensorTypeEnum.WindSpeed:
                return "wind_speed";
            case DashboardSensorTypeEnum.WindDirection:
                return "wind_direction";
            case DashboardSensorTypeEnum.Light:
                return "luminance";
            default:
                return "";
        }
    }
    
    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region liveDataForSensor

    [HttpGet("live-data-for-sensor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<FullDetailsModel>>> GetLiveDataForSensor(
        DashboardSensorTypeEnum sensorTypeEnum, string deviceIdStr = "all")
    {
        string selectedSensorStr = GetSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        var now = LocalDateTime.FromDateTime(DateTime.Now).Minus(Period.FromHours(5));

        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Device)
            .Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor.Id
                         && sd.Value != null
                         && sd.RecordDate > now
            );

        bool includeAllDevices = false;
        int[] deviceIdArray = null;

        // Parse device IDs from input
        if (!string.IsNullOrWhiteSpace(deviceIdStr))
        {
            var deviceIds = deviceIdStr.Split(',')
                .Select(id => id.Trim().ToLower())
                .ToArray();

            includeAllDevices = deviceIds.Contains("all");
            deviceIdArray = deviceIds
                .Where(id => id != "all") // Exclude "all" from device ID array
                .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
                .Where(id => id.HasValue)
                .Select(id => id.Value)
                .ToArray();
        }

        // Get valid device IDs from the database
        var validDeviceIds = await _dbContext.Devices
            .Where(d => deviceIdArray.Contains(d.Id))
            .Select(d => d.Id)
            .ToListAsync();

        if (deviceIdArray != null && validDeviceIds.Count != deviceIdArray.Length)
        {
            return BadRequest("There is a non-valid device ID.");
        }

        var deviceSensorData = query
            .Where(sd => validDeviceIds.Contains(sd.SensorDevice.Device.Id))
            .OrderByDescending(sd => sd.RecordDate)
            .AsEnumerable()
            .GroupBy(sd => sd.SensorDevice.Device.Id)
            .SelectMany(g => g.Take(10)) // Get latest 10 per device
            .ToList();

        // If no data found
        if (!deviceSensorData.Any() && !includeAllDevices)
        {
            return BadRequest("There is no data for the selected sensor and devices");
        }

        List<FullDetailsModel> result = new List<FullDetailsModel>();

        if (deviceSensorData.Any())
        {
            result = deviceSensorData.Select(sd => new FullDetailsModel
            {
                Id = sd.Id,
                SensorDevice = sd.SensorDevice,
                Value = sd.Value,
                RecordDate = sd.RecordDate
            }).ToList();
        }

        if (includeAllDevices)
        {
            deviceSensorData = query
                .OrderByDescending(sd => sd.RecordDate)
                .AsEnumerable()
                .Take(10)
                .ToList();
            
            
            var sensorData = deviceSensorData
                .AsEnumerable()
                .GroupBy(s => new
                {
                    Year = s.RecordDate.Year,
                    Month = s.RecordDate.Month,
                    Day = s.RecordDate.Day,
                    Hour = s.RecordDate.Hour,
                    Minute = s.RecordDate.Minute,
                    Second = s.RecordDate.Second,
                })
                .Select(g => new
                {
                    TimePeriod = new LocalDateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, g.Key.Minute, 0),
                    AvgValue = g.Average(a => a.Value ?? 0),
                })
                .Take(10)
                .ToList();


            if (!sensorData.Any())
            {
                return BadRequest("There is no data for the selected sensor.");
            }

            var avgResult = sensorData.Select(sd => new FullDetailsModel()
            {
                Id = 0,
                SensorDevice = null,
                Value = sd.AvgValue,
                RecordDate = sd.TimePeriod,
            }).ToList();

            result.AddRange(avgResult);
        }

        return Ok(result);
    }

    [JsonSchema(Name = "CustomDashboardDataFullDetailsModel")]
    public class FullDetailsModel
    {
        public int Id { get; set; }
        public SensorDevice? SensorDevice { get; set; }
        public decimal? Value { get; set; }
        public LocalDateTime RecordDate { get; set; }
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region LiveGauge

    [HttpGet("get-live-gauge")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<decimal>> GetLiveGaugeAllDevicesAverage(DashboardSensorTypeEnum sensorTypeEnum) 
    
    {
        string selectedSensorStr = GetSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        // check if selected sensor type exists 
        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }
        

        var now = LocalDateTime.FromDateTime(DateTime.Now).Minus(Period.FromHours(5));

        var query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(s => s.Sensor)
            .Where(sd => sd.Value != null
                         && sd.RecordDate > now
                         && sd.SensorDevice.Sensor.Id == selectedSensor.Id);
        
        var latestPerDevice = await query
            .GroupBy(g => g.SensorDevice.Device.Id) // Group by device
            .Select(g => g.OrderByDescending(sd => sd.RecordDate).FirstOrDefault()) // Get top one for each  device
            .ToListAsync();

        if (!latestPerDevice.Any())
        {
            return BadRequest("Data is too old or not available.");
        }

        // calculate the average from all the devices
        var latestAverage = latestPerDevice.Average(sd => sd.Value);

        return Ok(latestAverage);
    }
    
    [HttpGet("get-live-gauge-for-device")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GaugeWithRulesModel>> GetLiveGaugeDevicesAverage(DashboardSensorTypeEnum sensorTypeEnum
        ,string? deviceIdStr = "all") 
    
    {
        string selectedSensorStr = GetSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        // check if selected sensor type exists 
        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }
        
        bool includeAllDevices = false;
        int[] deviceIdArray = null;

        // Parse device IDs from input
        if (!string.IsNullOrWhiteSpace(deviceIdStr))
        {
            var deviceIds = deviceIdStr.Split(',')
                .Select(id => id.Trim().ToLower())
                .ToArray();

            includeAllDevices = deviceIds.Contains("all");
            deviceIdArray = deviceIds
                .Where(id => id != "all") // Exclude "all" from device ID array
                .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
                .Where(id => id.HasValue)
                .Select(id => id.Value)
                .ToArray();
        }

        // Get valid device IDs from the database
        var validDeviceIds = await _dbContext.Devices
            .Where(d => deviceIdArray.Contains(d.Id))
            .Select(d => d.Id)
            .ToListAsync();

        if (deviceIdArray != null && validDeviceIds.Count != deviceIdArray.Length)
        {
            return BadRequest("There is a non-valid device ID.");
        }

        var now = LocalDateTime.FromDateTime(DateTime.Now).Minus(Period.FromHours(5));

        var query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(s => s.Sensor)
            .Where(sd => sd.Value != null
                         && sd.RecordDate > now
                         && sd.SensorDevice.Sensor.Id == selectedSensor.Id);
        
        
        if (!query.Any())
        {
            return BadRequest("Data is too old or not available.");
        }

        if (!includeAllDevices)
        {
            query = query.Where(sd => validDeviceIds.Contains(sd.SensorDevice.Device.Id));
        }

        // Compute the average value from the query
        var latestPerDevice = await query
            .GroupBy(g => g.SensorDevice.Device.Id) // Group by device
            .Select(g => g.OrderByDescending(sd => sd.RecordDate).FirstOrDefault()) // Get top one for each  device
            .ToListAsync();

        if (!latestPerDevice.Any())
        {
            return BadRequest("Data is too old or not available.");
        }

        // calculate the average from all the devices
        var latestAverage = latestPerDevice.Average(sd => sd.Value);
        var rules = await _dbContext.CustomRules
            .Where(r => r.SensorId == selectedSensor.Id)
            .ToListAsync();


            var liveGaugeResult = new GaugeWithRulesModel()
            {
                Measurement = latestAverage,
                CustomRule = rules.Any() ? MatchRuleWithReference(latestAverage, rules) : null
            };

        return Ok(liveGaugeResult);
    }
    
    
    private CustomRule?  MatchRuleWithReference(decimal? avgValue, List<CustomRule> rules)
    {
        if (!avgValue.HasValue)
        {
            return null;
        }

        var matchedRule = rules.FirstOrDefault(rule =>
            (rule.Min == null || avgValue >= rule.Min) &&
            (rule.Max == null || avgValue <= rule.Max));

        return matchedRule;
    }
    public class GaugeWithRulesModel
    {
       public decimal? Measurement { get; set; }
       public CustomRule? CustomRule { get; set; }
    }
    
    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region GetDataForSensor

    [HttpPost("get-data-for-sensor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<SensorDataFullDetailsModelWithRules>>> GetDataForSensor(
        GetDataForSensorInputModel inputModel
    )
    {
        if (inputModel.EndDate > inputModel.EndDate)
        {
            return BadRequest("Start time cannot be after end time.");
        }

        string selectedSensorStr = GetSensorTypeName(inputModel.SensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        var timeZone = DateTimeZoneProviders.Tzdb["Asia/Nicosia"];
        var startLocalDateTime = inputModel.StartDate.AtStartOfDayInZone(timeZone).LocalDateTime;
        var endLocalDateTime = inputModel.EndDate.PlusDays(1).AtStartOfDayInZone(timeZone).LocalDateTime;

        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
                .Include(sd => sd.SensorDevice)
                .ThenInclude(sd => sd.Sensor)
                .Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor.Id &&
                             sd.RecordDate >= startLocalDateTime &&
                             sd.RecordDate <= endLocalDateTime
                )
                .OrderBy(ob => ob.RecordDate)
            ;

        var rules = await _dbContext.CustomRules
            .Where(r => r.SensorId == selectedSensor.Id)
            .ToListAsync();

        var sensorData = query
            .AsEnumerable()
            .GroupBy(s => new
            {
                Year = s.RecordDate.Year,
                Month = s.RecordDate.Month,
                Week = inputModel.IntervalTypeEnum == DashboardIntervalTypeEnum.Weekly
                    ? ISOWeek.GetWeekOfYear(s.RecordDate.ToDateTimeUnspecified())
                    : 0,
                Day = (inputModel.IntervalTypeEnum == DashboardIntervalTypeEnum.Daily ||
                       inputModel.IntervalTypeEnum == DashboardIntervalTypeEnum.Hourly)
                    ? s.RecordDate.Day
                    : 1,
                Hour = inputModel.IntervalTypeEnum == DashboardIntervalTypeEnum.Hourly ? s.RecordDate.Hour : 0
            })
            .Select(g => new
            {
                TimePeriod = inputModel.IntervalTypeEnum switch
                {
                    DashboardIntervalTypeEnum.Hourly => new LocalDateTime(g.Key.Year, g.Key.Month, g.Key.Day,
                        g.Key.Hour, 0),
                    DashboardIntervalTypeEnum.Daily => new LocalDateTime(g.Key.Year, g.Key.Month, g.Key.Day, 0, 0),
                    DashboardIntervalTypeEnum.Weekly =>
                        LocalDate.FromDateTime(ISOWeek.ToDateTime(g.Key.Year, g.Key.Week, DayOfWeek.Monday))
                            .AtStartOfDayInZone(timeZone)
                            .LocalDateTime,
                    DashboardIntervalTypeEnum.Monthly => new LocalDateTime(g.Key.Year, g.Key.Month, 1, 0, 0),
                    DashboardIntervalTypeEnum.Yearly => new LocalDateTime(g.Key.Year, 1, 1, 0, 0),
                    _ => throw new ArgumentException("Invalid interval type.")
                },
                AvgValue = g.Average(a => a.Value ?? 0),
            })
            .ToList();

        if (!sensorData.Any())
        {
            return BadRequest("There is no data for the selected sensor.");
        }

        var result = sensorData.Select(sd => new SensorDataFullDetailsModelWithRules()
        {
            Sensor = selectedSensor,
            Value = sd.AvgValue,
            RecordDate = sd.TimePeriod,
            Rule = rules.Any() ? MatchRule(sd.AvgValue, rules) : "No rules"
        }).ToList();

        return Ok(result);
    }
    
    private string MatchRule(decimal? avgValue, List<CustomRule> rules)
    {
        if (!avgValue.HasValue)
        {
            return "No Rules";
        }

        var matchedRule = rules.FirstOrDefault(rule =>
            (rule.Min == null || avgValue >= rule.Min) &&
            (rule.Max == null || avgValue <= rule.Max));

        return matchedRule?.ProgramDirective ?? "No Rules";
    }

    public class SensorDataFullDetailsModelWithRules
    {
        public Sensor? Sensor { get; set; }
        public decimal? Value { get; set; }
        public LocalDateTime RecordDate { get; set; }
        public string Rule { get; set; }
    }

    [JsonSchema(Name = "GetDataForSensorInputModel")]
    public class GetDataForSensorInputModel
    {
        public DashboardSensorTypeEnum SensorTypeEnum { get; set; }
        public DashboardIntervalTypeEnum IntervalTypeEnum { get; set; }
        public LocalDate StartDate { get; set; }
        public LocalDate EndDate { get; set; }
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region GetYTDComparisonForSensor

    [HttpGet("get-ytd-comparison-for-sensor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<MonthlySensorComparison>>> GetYtdComparisonForSensor(
        DashboardSensorTypeEnum sensorTypeEnum, int year1, int year2)
    {
        string selectedSensorStr = GetSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        // Get data for both years
        var sensorData = await _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor.Id &&
                         (sd.RecordDate.Year == year1 || sd.RecordDate.Year == year2))
            .GroupBy(sd => new
            {
                sd.RecordDate.Year,
                sd.RecordDate.Month
            })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                AvgValue = g.Average(sd => sd.Value ?? 0)
            })
            .ToListAsync();

        if (!sensorData.Any())
        {
            return BadRequest("No data available for the selected sensor and years.");
        }

        // Create result structure with all months
        var result = new List<MonthlySensorComparison>();
        var monthNames = new[]
        {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        };

        for (int month = 1; month <= 12; month++)
        {
            var year1Data = sensorData.FirstOrDefault(d => d.Year == year1 && d.Month == month);
            var year2Data = sensorData.FirstOrDefault(d => d.Year == year2 && d.Month == month);

            result.Add(new MonthlySensorComparison
            {
                Month = monthNames[month - 1],
                Year1Value = year1Data?.AvgValue ?? null,
                Year2Value = year2Data?.AvgValue ?? null
            });
        }

        return Ok(result);
    }

    public class MonthlySensorComparison
    {
        public string Month { get; set; }
        public decimal? Year1Value { get; set; }
        public decimal? Year2Value { get; set; }
    }

    #endregion


// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region liveData

    [HttpGet("live-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<FullDetailsModel>>> GetLiveData(
        string sensorIdStr, string deviceIdStr)
    {
        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Device);

        int[] deviceIdArray = null;
        int[] sensorIdArray = null;

        // Parse and validate device IDs
        deviceIdArray = deviceIdStr.Split(',')
            .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToArray();

        var validDeviceIds = await _dbContext.Devices
            .Where(d => deviceIdArray.Contains(d.Id))
            .Select(d => d.Id)
            .ToListAsync();

        if (validDeviceIds.Count != deviceIdArray.Length)
        {
            return BadRequest("There is a non valid device ID");
        }

        sensorIdArray = sensorIdStr.Split(',')
            .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToArray();

        var validSensorIds = await _dbContext.Sensors
            .Where(d => sensorIdArray.Contains(d.Id))
            .Select(d => d.Id)
            .ToListAsync();

        if (validSensorIds.Count != sensorIdArray.Length)
        {
            return BadRequest("There is a non valid sensor ID");
        }

        query = query.Where(sd =>
            validDeviceIds.Contains(sd.SensorDevice.Device.Id) &&
            validSensorIds.Contains(sd.SensorDevice.Sensor.Id)
        );

        // Group data using device then  top 10 per device
        var groupedSensorData = query
            .OrderByDescending(sd => sd.RecordDate)
            .AsEnumerable()
            .GroupBy(sd => sd.SensorDevice.Device.Id)
            .SelectMany(g => g.Take(10))
            .ToList();

        if (!groupedSensorData.Any())
        {
            return BadRequest("There are no data for that sensor.");
        }

        var result = groupedSensorData.Select(sd => new FullDetailsModel
        {
            Id = sd.Id,
            SensorDevice = sd.SensorDevice,
            Value = sd.Value,
            RecordDate = sd.RecordDate
        }).ToList();

        return Ok(result);
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================
// Filter devices based on sensors id or based on sensors name from the enum

    #region filterDevices

    [HttpGet("filter-devices")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DeviceReferenceModel>>> FilterDevices(
        [FromQuery] string? sensorIdStr = null,
        [FromQuery] DashboardSensorTypeEnum? sensorTypeEnum = null)
    {
        if (sensorIdStr == null && sensorTypeEnum == null)
        {
            return BadRequest("Must provide a Sensor");
        }

        if (sensorIdStr != null && sensorTypeEnum != null)
        {
            return BadRequest("Only one way to provide a Sensor is supported");
        }

        int[] sensorIdArray = null;
        List<int> validSensorIds = new List<int>();

        if (sensorIdStr != null && sensorTypeEnum == null)
        {
            sensorIdArray = sensorIdStr.Split(',')
                .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .ToArray();

            validSensorIds = await _dbContext.Sensors
                .Where(s => sensorIdArray.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            if (validSensorIds.Count != sensorIdArray.Length)
            {
                return BadRequest("There are invalid sensor Ids");
            }
        }
        else if (sensorIdStr == null && sensorTypeEnum != null)
        {
            string selectedSensorStr = GetSensorTypeName(sensorTypeEnum ?? DashboardSensorTypeEnum.Temperature);
            validSensorIds = await _dbContext.Sensors
                .Where(s => s.Name == selectedSensorStr)
                .Select(s => s.Id)
                .ToListAsync();

            if (!validSensorIds.Any())
            {
                return BadRequest("Sensor is invalid.");
            }
        }

        var devicesWithSensors = await _dbContext.SensorDevices
            .Where(sd => validSensorIds.Contains(sd.SensorId))
            .GroupBy(sd => sd.DeviceId)
            .Where(g => g.Select(sd => sd.SensorId).Distinct().Count() ==
                        validSensorIds.Count)
            .Select(g => g.Key)
            .ToListAsync();

        var result = await _dbContext.Devices
            .Where(d => devicesWithSensors.Contains(d.Id))
            .Select(d => new DeviceReferenceModel
            {
                Id = d.Id,
                Name = d.Name,
                Nickname = d.Nickname
            })
            .ToListAsync();

        return Ok(result);
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================
// Filter sensors based on devices 

    #region filterSensors

    [HttpGet("filter-sensors")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<SensorReferenceModel>>> FilterSensor(
        string deviceIdStr)
    {
        int[] deviceIdArray = deviceIdStr.Split(',')
            .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToArray();

        var validDeviceIds = await _dbContext.Devices
            .Where(s => deviceIdArray.Contains(s.Id))
            .Select(s => s.Id)
            .ToListAsync();

        if (validDeviceIds.Count != deviceIdArray.Length)
        {
            return BadRequest("There are invalid device Ids");
        }

        var sensorsWithDevices = await _dbContext.SensorDevices
            .Where(sd => validDeviceIds.Contains(sd.DeviceId))
            .GroupBy(sd => sd.SensorId)
            .Where(g => g.Select(sd => sd.DeviceId).Distinct().Count() ==
                        validDeviceIds.Count)
            .Select(g => g.Key) // Select the DeviceId
            .ToListAsync();

        var result = await _dbContext.Sensors
            .Where(d => sensorsWithDevices.Contains(d.Id))
            .Select(d => new SensorReferenceModel
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description
            })
            .ToListAsync();

        return Ok(result);
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region getCustomRulesForSensor

    [HttpGet("custom-rules-for-sensor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<CustomRulesController.ListModel>>> GetCustomRulesForSensor(
        DashboardSensorTypeEnum sensorType)
    {
        string selectedSensorStr = GetSensorTypeName(sensorType);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        var customRules = await _dbContext.CustomRules
            .Where(cl => cl.Sensor == selectedSensor)
            .ToListAsync();

        return customRules.Any() ? Ok(customRules) : BadRequest("There are no Custom Rules for this sensor");
    }

    #endregion
}