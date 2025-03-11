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

    string getSensorTypeName(DashboardSensorTypeEnum dashboardSensorTypeEnum)
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

    [HttpGet("live-data-for-sensor/{sensorTypeEnum}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<FullDetailsModel>>> GetLiveDataForSensor(
        DashboardSensorTypeEnum sensorTypeEnum, string deviceIdStr)
    {
        string selectedSensorStr = getSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Device)
            .Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor.Id);

        int[] deviceIdArray = null;

        // Parse and validate device IDs
        deviceIdArray = deviceIdStr.Split(',')
            .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id.Value)
            .ToArray();

        var validDeviceIds = await _dbContext.Devices
            .Where(d => deviceIdArray.Contains(d.Id))
            .Select(d => d.Id)
            .ToListAsync();

        if (validDeviceIds.Count != deviceIdArray.Length)
        {
            return BadRequest("There is a non valid device ID");
        }

        query = query.Where(sd => validDeviceIds.Contains(sd.SensorDevice.Device.Id));

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

    [JsonSchema(Name = "SensorsDataFullDetailsModel")]
    public class FullDetailsModel
    {
        public int Id { get; set; }
        public SensorDevice SensorDevice { get; set; } = null!;
        public decimal? Value { get; set; }
        public LocalDateTime RecordDate { get; set; }
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region LiveGauge

    [HttpGet("get-live-gauge/{sensorTypeEnum}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<FullDetailsModel>>> GetLiveGauge(DashboardSensorTypeEnum sensorTypeEnum)
    {
        string selectedSensorStr = getSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        // check if selected sensor type exists 
        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        var latestData = await _dbContext.SensorDeviceDatas
            .OrderByDescending(sd => sd.RecordDate)
            .FirstOrDefaultAsync();

        if (latestData == null)
        {
            return BadRequest("No data available.");
        }

        var now = LocalDateTime.FromDateTime(DateTime.Now);
        ;

        var totalDuration = now - latestData.RecordDate;

        // check that the time difference is within one hour.
        if (totalDuration.Hours > 1)
        {
            return BadRequest("Data is too old or not available.");
        }

        return Ok(latestData);
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region GetDataForSensor

    [HttpGet("get-data-for-sensor/{sensorTypeEnum}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<SensorDataFullDetailsModel>>> GetDataForSensor(
        DashboardSensorTypeEnum sensorTypeEnum,
        DashboardIntervalTypeEnum intervalTypeEnum,
        LocalDate startDate,
        LocalDate endDate)
    {
        if (startDate > endDate)
        {
            return BadRequest("Start time cannot be after end time.");
        }

        string selectedSensorStr = getSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        var timeZone = DateTimeZoneProviders.Tzdb["Asia/Nicosia"];
        var startLocalDateTime = startDate.AtStartOfDayInZone(timeZone).LocalDateTime;
        var endLocalDateTime = endDate.PlusDays(1).AtStartOfDayInZone(timeZone).LocalDateTime;

        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor.Id &&
                         sd.RecordDate >= startLocalDateTime &&
                         sd.RecordDate <= endLocalDateTime
            );

        var rules = await _dbContext.CustomRules
            .Where(r => r.SensorId == selectedSensor.Id)
            .ToListAsync();

        var sensorData = query
            .AsEnumerable()
            .GroupBy(s => new
            {
                Year = s.RecordDate.Year,
                Month = s.RecordDate.Month,
                Week = intervalTypeEnum == DashboardIntervalTypeEnum.Weekly
                    ? ISOWeek.GetWeekOfYear(s.RecordDate.ToDateTimeUnspecified())
                    : 0,
                Day = (intervalTypeEnum == DashboardIntervalTypeEnum.Daily ||
                       intervalTypeEnum == DashboardIntervalTypeEnum.Hourly)
                    ? s.RecordDate.Day
                    : 1,
                Hour = intervalTypeEnum == DashboardIntervalTypeEnum.Hourly ? s.RecordDate.Hour : 0
            })
            .Select(g => new
            {
                TimePeriod = intervalTypeEnum switch
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

        var result = sensorData.Select(sd => new SensorDataFullDetailsModel()
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

    public class SensorDataFullDetailsModel
    {
        public Sensor? Sensor { get; set; }
        public decimal? Value { get; set; }
        public LocalDateTime RecordDate { get; set; }
        public string Rule { get; set; }
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region GetYTDComparisonForSensor

    [HttpGet("get-ytd-comparison-for-sensor/{sensorTypeEnum}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<SensorDataFullDetailsModel>>> GetYtdComparisonForSensor(
        DashboardSensorTypeEnum sensorTypeEnum, int year1, int year2)
    {
        string selectedSensorStr = getSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor.Id &&
                         sd.RecordDate.Year == year1 ||
                         sd.RecordDate.Year == year2
            );

        var rules = await _dbContext.CustomRules
            .Where(r => r.SensorId == selectedSensor.Id)
            .ToListAsync();

        var sensorData = query
            .AsEnumerable()
            .GroupBy(g => new
            {
                g.RecordDate.Year,
                Month = g.RecordDate.Month,
            })
            .Select(s => new
            {
                TimePeriod = new LocalDateTime(s.Key.Year, s.Key.Month, 1, 0, 0),
                AvgValue = s.Average(a => a.Value ?? 0),
            })
            .ToList();

        if (!sensorData.Any())
        {
            return BadRequest("There is no data for the selected sensor.");
        }

        var result = sensorData.Select(sd => new SensorDataFullDetailsModel()
        {
            Sensor = selectedSensor,
            Value = sd.AvgValue,
            RecordDate = sd.TimePeriod,
            Rule = rules.Any() ? MatchRule(sd.AvgValue, rules) : "No rules"
        }).ToList();

        return Ok(result);
    }

    #endregion


// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    #region liveData

    [HttpGet("live-data/{sensorIdStr?}/{deviceIdStr?}")]
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
// Filter devices based on sensors 

    #region filterDevices

    [HttpGet("filter-devices/{sensorIdStr?}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DeviceReferenceModel>>> FilterDevices(
        string sensorIdStr)
    {
        int[] sensorIdArray = sensorIdStr.Split(',')
            .Select(id => int.TryParse(id, out int num) ? num : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToArray();

        var validSensorIds = await _dbContext.Sensors
            .Where(s => sensorIdArray.Contains(s.Id))
            .Select(s => s.Id)
            .ToListAsync();

        if (validSensorIds.Count != sensorIdArray.Length)
        {
            return BadRequest("There are invalid sensor Ids");
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

    [HttpGet("filter-sensors/{deviceIdStr?}")]
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


}