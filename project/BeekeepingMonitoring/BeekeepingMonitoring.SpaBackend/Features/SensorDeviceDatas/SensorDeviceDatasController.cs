using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Features.SensorDevices;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;
using NodaTime;

namespace BeekeepingMonitoring.SpaBackend.Features.SensorDeviceDatas;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/sensor-device-datas")]
[Authorize]
[AutoConstructor]
public partial class SensorDeviceDatasController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    #region Create

    [JsonSchema(Name = "SensorDeviceDataCreateModel")]
    public class CreateModel
    {
        public required int SensorDeviceId { get; set; }

        public required decimal? Value { get; set; }

        public required LocalDateTime RecordDate { get; set; }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> Create(CreateModel model)
    {
        SensorDevice? sensorDevice = await _dbContext.SensorDevices.FirstOrDefaultAsync(s => s.Id == model.SensorDeviceId);
        if (sensorDevice == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.SensorDeviceId,
                "Sensor device not found"
            );
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem();
        }

        SensorDeviceData sensorDeviceData = _mapper.Map<SensorDeviceData>(model);

        _dbContext.SensorDeviceDatas.Add(sensorDeviceData);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = sensorDeviceData.Id }, sensorDeviceData.Id);
    }

    #endregion

    #region List

    [HttpGet]
    public async Task<IEnumerable<ListModel>> List()
    {
        return await _dbContext.SensorDeviceDatas
            .ProjectTo<ListModel>(_mapper)
            .ToArrayAsync();
    }

    [JsonSchema(Name = "SensorDeviceDatasListModel")]
    public class ListModel
    {
        public required int Id { get; set; }

        public required SensorDeviceReferenceModel SensorDevice { get; set; }

        public required decimal? Value { get; set; }

        public required LocalDateTime RecordDate { get; set; }
    }

    #endregion

    #region ListForReference

    [HttpGet("for-reference")]
    public async Task<IEnumerable<SensorDeviceDataReferenceModel>> ListForReference()
    {
        return await _dbContext.SensorDeviceDatas
            .ProjectTo<SensorDeviceDataReferenceModel>(_mapper)
            .ToArrayAsync();
    }

    #endregion

    #region Get

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DetailsModel>> Get(int id)
    {
        DetailsModel? model = await _dbContext.SensorDeviceDatas
            .Where(s => s.Id == id)
            .ProjectTo<DetailsModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "SensorDeviceDataDetailsModel")]
    public class DetailsModel
    {
        public required int Id { get; set; }

        public required SensorDeviceReferenceModel SensorDevice { get; set; }

        public required decimal? Value { get; set; }

        public required LocalDateTime RecordDate { get; set; }
    }

    #endregion

    #region Update

    [HttpGet("{id:int}/for-update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UpdateModel>> GetForUpdate(int id)
    {
        UpdateModel? model = await _dbContext.SensorDeviceDatas
            .Where(s => s.Id == id)
            .ProjectTo<UpdateModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "SensorDeviceDataUpdateModel")]
    public class UpdateModel
    {
        public required int SensorDeviceId { get; set; }

        public required decimal? Value { get; set; }

        public required LocalDateTime RecordDate { get; set; }
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UpdateModel>> Update(int id, UpdateModel model)
    {
        SensorDeviceData? sensorDeviceData = await _dbContext.SensorDeviceDatas
            .SingleOrDefaultAsync(s => s.Id == id);

        if (sensorDeviceData == null) return NotFound();

        SensorDevice? sensorDevice = await _dbContext.SensorDevices.FirstOrDefaultAsync(s => s.Id == model.SensorDeviceId);
        if (sensorDevice == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.SensorDeviceId,
                "Sensor device not found"
            );
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem();
        }

        _mapper.Map(model, sensorDeviceData);

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict();
        }

        return Ok(_mapper.Map<UpdateModel>(sensorDeviceData));
    }

    #endregion

    #region Delete

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        SensorDeviceData? sensorDeviceData = await _dbContext.SensorDeviceDatas
            .SingleOrDefaultAsync(s => s.Id == id);

        if (sensorDeviceData == null)
        {
            return NotFound();
        }

        _dbContext.SensorDeviceDatas.Remove(sensorDeviceData);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    #endregion
    
    #region getForSensor

    [HttpGet("get-for-sensor/{sensorIdStr}/{deviceIdStr}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<LiveDataFullDetailsModel>>> GetForSensor(string sensorIdStr, string deviceIdStr = "all")
    {
        var selectedSensor = await _dbContext.Sensors
            .Where(s => s.Id == int.Parse(sensorIdStr))
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


 [HttpGet("get-sensor/{sensorIdStr?}/{deviceIdStr?}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Dictionary<int, List<SensorDateStatistics>>>> GetSensor(string sensorIdStr = null, string deviceIdStr = null)
{
    var sensorIdStrings = string.IsNullOrEmpty(sensorIdStr) ? Array.Empty<string>() : sensorIdStr.Split(',');
    var deviceIdStrings = string.IsNullOrEmpty(deviceIdStr) ? Array.Empty<string>() : deviceIdStr.Split(',');

    // Try parsing the sensor IDs
    if (!sensorIdStrings.All(s => int.TryParse(s, out _)))
    {
        return BadRequest("One or more Sensor IDs are not valid integers.");
    }

    // Try parsing the device IDs
    if (!deviceIdStrings.All(d => int.TryParse(d, out _)))
    {
        return BadRequest("One or more Device IDs are not valid integers.");
    }

    // Convert to integer arrays
    int[] sensorIdArray = sensorIdStrings.Select(int.Parse).ToArray();
    int[] deviceIdArray = deviceIdStrings.Select(int.Parse).ToArray();

    // Check if at least one of the arrays is provided and non-empty
    if (sensorIdArray.Length == 0 && deviceIdArray.Length == 0)
    {
        return BadRequest("At least one sensor ID or device ID must be provided.");
    }

    IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
        .Include(sd => sd.SensorDevice)
        .ThenInclude(sd => sd.Sensor)
        .Include(sd => sd.SensorDevice)
        .ThenInclude(sd => sd.Device);

    // Apply filters based on the provided sensorId and deviceId arrays
    if (sensorIdArray.Length > 0)
    {
        query = query.Where(sd => sensorIdArray.Contains(sd.SensorDevice.SensorId));
    }

    if (deviceIdArray.Length > 0)
    {
        query = query.Where(sd => deviceIdArray.Contains(sd.SensorDevice.DeviceId));
    }

    // Fetch the data
    var sensorData = await query
        .OrderBy(sd => sd.RecordDate)
        .ToListAsync();

    if (!sensorData.Any())
    {
        return NotFound();
    }

    // Group by SensorId and RecordDate (ignoring device) and calculate statistics across all devices
    var groupedData = sensorData
        .GroupBy(sd => new { sd.SensorDevice.SensorId, sd.RecordDate })
        .GroupBy(g => g.Key.SensorId)
        .ToDictionary(
            g => g.Key,
            g => g
                .Select(group => new SensorDateStatistics
                {
                    RecordedDate = group.Key.RecordDate,
                    Sum = group.Sum(sd => sd.Value ?? 0),
                    Max = group.Max(sd => sd.Value ?? 0),
                    Min = group.Min(sd => sd.Value ?? 0),
                    Avg = group.Average(sd => sd.Value ?? 0)
                })
                .OrderByDescending(stats => stats.RecordedDate) // Order by date descending
                .Take(50) // Limit to 50 entries per sensor
                .ToList()
        );

    return Ok(groupedData);
}

public class SensorDateStatistics
{
    public LocalDateTime RecordedDate { get; set; }
    public decimal Sum { get; set; }
    public decimal Max { get; set; }
    public decimal Min { get; set; }
    public decimal Avg { get; set; }
}

    [JsonSchema(Name = "SensorsLiveDataFullDetailsModel")]
    public class LiveDataFullDetailsModel
    {
        public int Id { get; set; }
        public SensorDevice SensorDevice { get; set; } = null!;
        public int SensorDeviceId { get; set; }
        public decimal? Value { get; set; }
        public LocalDateTime RecordDate { get; set; }
        public Statistics? Statistics { get; set; }
    }
    
    [JsonSchema(Name = "SensorsDataFullDetailsModel")]
    public class FullDetailsModel
    {
        public int Id { get; set; }
        public SensorDevice SensorDevice { get; set; } = null!;
        public int SensorDeviceId { get; set; }
        public decimal? Value { get; set; }
        public LocalDateTime RecordDate { get; set; }
        public Statistics? Statistics { get; set; }
    }

    [JsonSchema(Name = "SensorsDataStatistics")]
    public class Statistics
    {
        public decimal MinValue { get; set; }
        public decimal MaxValue { get; set; }
        public decimal AverageValue { get; set; }
        public decimal Sum { get; set; }
    }

    private Statistics CalculateStatistics(List<decimal> recentValues)
    {
        var stats = new Statistics();

        if (recentValues.Count == 0)
        {
            return stats;
        }

        stats.MinValue = recentValues.Min();
        stats.MaxValue = recentValues.Max();
        stats.AverageValue = recentValues.Average();
        stats.Sum = recentValues.Sum();

        return stats;
    }

    public class SensorStatisticsModel
    {
        public int SensorId { get; set; }
        public LocalDateTime? RecordDate { get; set; }
        public decimal Average { get; set; }
        public decimal Minimum { get; set; }
        public decimal Maximum { get; set; }
        public decimal Sum { get; set; }
    }

    #endregion
}