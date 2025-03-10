using System.Collections.Generic;
using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Features.CustomRules;
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
    // private readonly TimeZoneConverterService _timeZoneConverterService;

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
        hourly = 0,
        daily = 1,
        weekly = 2,
        monthly = 3,
        yearly = 4,
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

        return "";
    }

    // @TODO Delete this function on cleanup does not serve any purpose 
    string getIntervalTypeName(DashboardIntervalTypeEnum dashboardIntervalTypeEnum)
    {
        switch (dashboardIntervalTypeEnum)
        {
            case DashboardIntervalTypeEnum.hourly:
                return "hourly";
            case DashboardIntervalTypeEnum.daily:
                return "daily";
            case DashboardIntervalTypeEnum.weekly:
                return "weekly";
            case DashboardIntervalTypeEnum.monthly:
                return "monthly";
            case DashboardIntervalTypeEnum.yearly:
                return "yearly";
            default:
                return "";
        }

        return "";
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
                Week = intervalTypeEnum == DashboardIntervalTypeEnum.weekly
                    ? ISOWeek.GetWeekOfYear(s.RecordDate.ToDateTimeUnspecified())
                    : 0,
                Day = (intervalTypeEnum == DashboardIntervalTypeEnum.daily ||
                       intervalTypeEnum == DashboardIntervalTypeEnum.hourly)
                    ? s.RecordDate.Day
                    : 1,
                Hour = intervalTypeEnum == DashboardIntervalTypeEnum.hourly ? s.RecordDate.Hour : 0
            })
            .Select(g => new
            {
                TimePeriod = intervalTypeEnum switch
                {
                    DashboardIntervalTypeEnum.hourly => new LocalDateTime(g.Key.Year, g.Key.Month, g.Key.Day,
                        g.Key.Hour, 0),
                    DashboardIntervalTypeEnum.daily => new LocalDateTime(g.Key.Year, g.Key.Month, g.Key.Day, 0, 0),
                    DashboardIntervalTypeEnum.weekly =>
                        LocalDate.FromDateTime(ISOWeek.ToDateTime(g.Key.Year, g.Key.Week, DayOfWeek.Monday))
                            .AtStartOfDayInZone(timeZone)
                            .LocalDateTime,
                    DashboardIntervalTypeEnum.monthly => new LocalDateTime(g.Key.Year, g.Key.Month, 1, 0, 0),
                    DashboardIntervalTypeEnum.yearly => new LocalDateTime(g.Key.Year, 1, 1, 0, 0),
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
        DashboardSensorTypeEnum sensorTypeEnum, int year1, int year2, string deviceIdStr = "all")
    {
        // check the valitity of the years
        if (year1 <= 0 || year2 <= 0)
        {
            return BadRequest("Provided year does not exists");
        }

        string selectedSensorStr = getSensorTypeName(sensorTypeEnum);
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Name == selectedSensorStr)
            .SingleOrDefaultAsync();

        // check if selected sensor type exists 
        if (selectedSensor == null)
        {
            return BadRequest("Sensor is invalid.");
        }

        var deviceIdStrings = deviceIdStr.Split(',');
        int[] deviceIdArray = null;

        if (deviceIdStr != "all")
        {
            // Try parsing the device IDs
            if (!deviceIdStrings.All(d => int.TryParse(d, out _)))
            {
                return BadRequest("One or more Device IDs are not valid integers.");
            }

            deviceIdArray = deviceIdStrings.Select(int.Parse).ToArray();
        }

        // Base query with INNER JOINs
        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Device);

        query = query.Where(sd => sd.SensorDevice.Sensor.Id == selectedSensor!.Id);

        // Fetch rules for the given sensor ID
        var rules = await _dbContext.CustomRules
            .Where(r => r.SensorId == selectedSensor.Id)
            .ToListAsync();

        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================

        // Filter within date range
        query = query
            .Where(sd => sd.SensorDevice.SensorId == selectedSensor.Id &&
                         sd.RecordDate.Year == year1 &&
                         sd.RecordDate.Year == year2);

        var groupedQuery = query
            .AsEnumerable() // Moves execution to client side
            .GroupBy(s => new
            {
                Year = s.RecordDate.Year,
                Month = s.RecordDate.Month,
                Week = ISOWeek.GetWeekOfYear(s.RecordDate.ToDateTimeUnspecified()),
                Day = 1,
                Hour = s.RecordDate.Hour
            })
            .Select(g => new
            {
                TimePeriod = new LocalDateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, 0),
                AvgValue = g.Average(a => a.Value ?? 0),
                SensorDevice = g.First().SensorDevice
            })
            .Take(10)
            .ToList();

        // Fetch the data
        var sensorData = await query
            .OrderByDescending(sd => sd.RecordDate)
            .Take(10)
            .ToListAsync();

        if (!groupedQuery.Any())
        {
            return BadRequest("There are no data for that sensor");
        }

        var result = groupedQuery.Select(sd => new SensorDataFullDetailsModel()
        {
            Sensor = selectedSensor,
            Value = sd.AvgValue,
            RecordDate = sd.TimePeriod,
            Rule = MatchRule(sd.AvgValue, rules)
        }).ToList();

        return Ok(result);
    }

    #endregion

// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================

    [JsonSchema("CustomDashboardTileUpdateModel")]
    public class TileUpdateModel
    {
        /// <summary>
        /// Null = new tile.
        /// </summary>
        public required long? Id { get; init; }

        /// <summary>
        /// Must be set when (and only when) Id is null.
        /// Has no meaning outside of the API call which created the tile on the server.
        /// </summary>
        public required string? TempId { get; init; }

        public required int X { get; init; }
        public required int Y { get; init; }
        public required int Width { get; init; }
        public required int Height { get; init; }

        public required ConfDashboardTileType Type { get; init; }

        public required PredefinedVisualizationTileOptions? PredefinedVisualizationOptions { get; init; }
    }
}