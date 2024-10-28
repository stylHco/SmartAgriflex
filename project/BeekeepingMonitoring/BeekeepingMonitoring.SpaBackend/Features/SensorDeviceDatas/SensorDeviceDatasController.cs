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

        public required LocalDate RecordDate { get; set; }
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

        public required LocalDate RecordDate { get; set; }
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

        public required LocalDate RecordDate { get; set; }
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

        public required LocalDate RecordDate { get; set; }
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
    public async Task<ActionResult<List<FullDetailsModel>>> GetForSensor(string sensorIdStr, string deviceIdStr)
    {
        var sensorIdStrings = sensorIdStr.Split(',');
        var deviceIdStrings = deviceIdStr.Split(',');

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

        // Base query with INNER JOINs
        IQueryable<SensorDeviceData> query = _dbContext.SensorDeviceDatas
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Sensor)
            .Include(sd => sd.SensorDevice)
            .ThenInclude(sd => sd.Device);

        // Check if at least one of the arrays is provided and non-empty
        if ((sensorIdArray == null || sensorIdArray.Length == 0) &&
            (deviceIdArray == null || deviceIdArray.Length == 0))
        {
            return BadRequest("At least one sensor ID or device ID must be provided.");
        }

        // Validate and filter by sensor IDs
        if (sensorIdArray != null && sensorIdArray.Length > 0)
        {
            var validSensorIds = await _dbContext.Sensors
                .Where(s => sensorIdArray.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            if (validSensorIds.Count != sensorIdArray.Length)
            {
                return BadRequest("One or more Sensor IDs are invalid.");
            }

            query = query.Where(sd => sensorIdArray.Contains(sd.SensorDevice.Sensor.Id));
        }

        // Validate and filter by device IDs
        if (deviceIdArray != null && deviceIdArray.Length > 0)
        {
            var validDeviceIds = await _dbContext.Devices
                .Where(d => deviceIdArray.Contains(d.Id))
                .Select(d => d.Id)
                .ToListAsync();

            if (validDeviceIds.Count != deviceIdArray.Length)
            {
                return BadRequest("One or more Device IDs are invalid.");
            }

            query = query.Where(sd => deviceIdArray.Contains(sd.SensorDevice.Device.Id));
        }

        // Fetch the data
        var sensorData = await query
            .OrderByDescending(sd => sd.RecordDate)
            .Take(100)
            .ToListAsync();

        if (!sensorData.Any())
        {
            return NotFound();
        }

        List<decimal> recentValues = sensorData
            .Where(sd => sd.Value != null)       // Filter out nulls first
            .Select(sd => sd.Value.Value)         // Then select non-null decimal values
            .ToList();
        
        var calculatedStatistics = CalculateStatistics(recentValues);

        var result = sensorData.Select(sd => new FullDetailsModel
        {
            Id = sd.Id,
            SensorDevice = sd.SensorDevice,
            Value = sd.Value,
            RecordDate = sd.RecordDate,
            Statistics = calculatedStatistics
        }).ToList();

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
    public LocalDate RecordedDate { get; set; }
    public decimal Sum { get; set; }
    public decimal Max { get; set; }
    public decimal Min { get; set; }
    public decimal Avg { get; set; }
}

    // public async Task<ActionResult<List<FullDetailsModel>>> GetSensor(string sensorIdStr, string deviceIdStr)
    // {
    //     // Handle null or empty strings for sensorIdStr and deviceIdStr
    //     var sensorIdStrings = string.IsNullOrEmpty(sensorIdStr) ? Array.Empty<string>() : sensorIdStr.Split(',');
    //     var deviceIdStrings = string.IsNullOrEmpty(deviceIdStr) ? Array.Empty<string>() : deviceIdStr.Split(',');
    //
    //     // Try parsing the sensor IDs
    //     if (!sensorIdStrings.All(s => int.TryParse(s, out _)))
    //     {
    //         return BadRequest("One or more Sensor IDs are not valid integers.");
    //     }
    //
    //     // Try parsing the device IDs
    //     if (!deviceIdStrings.All(d => int.TryParse(d, out _)))
    //     {
    //         return BadRequest("One or more Device IDs are not valid integers.");
    //     }
    //
    //     // Convert to integer arrays
    //     int[] sensorIdArray = sensorIdStrings.Select(int.Parse).ToArray();
    //     int[] deviceIdArray = deviceIdStrings.Select(int.Parse).ToArray();
    //
    //     // Check if at least one of the arrays is provided and non-empty
    //     if ((sensorIdArray.Length == 0) && (deviceIdArray.Length == 0))
    //     {
    //         return BadRequest("At least one sensor ID or device ID must be provided.");
    //     }
    //
    //     // Base query with INNER JOINs
    //     IQueryable<SensorData> query = _dbContext.SensorsData
    //         .Include(sd => sd.SensorDevice)
    //         .ThenInclude(sd => sd.Sensor)
    //         .Include(sd => sd.SensorDevice)
    //         .ThenInclude(sd => sd.Device);
    //
    //     // Apply filters based on the provided sensorId and deviceId arrays
    //     if (sensorIdArray.Length > 0)
    //     {
    //         query = query.Where(sd => sensorIdArray.Contains(sd.SensorDevice.SensorId));
    //     }
    //
    //     if (deviceIdArray.Length > 0)
    //     {
    //         query = query.Where(sd => deviceIdArray.Contains(sd.SensorDevice.DeviceId));
    //     }
    //
    //     // Fetch the data
    //     var sensorData = await query
    //         .Take(100)
    //         .OrderByDescending(sd => sd.RecordDate)
    //         .ToListAsync();
    //
    //     if (!sensorData.Any())
    //     {
    //         return NotFound();
    //     }
    //
    //     var recentValues = sensorData.Select(sd => sd.Value).ToList();
    //     var calculatedStatistics = CalculateStatistics(recentValues);
    //
    //     var models = sensorData.Select(sd => new FullDetailsModel
    //     {
    //         Id = sd.Id,
    //         SensorDevice = sd.SensorDevice,
    //         Value = sd.Value,
    //         RecordDate = sd.RecordDate,
    //         Statistics = calculatedStatistics
    //     }).ToList();
    //
    //     return Ok(models);
    // }

    // [HttpGet("get-for-sensor-top-one/{sensorId?}/{deviceId?}")]
    // [ProducesResponseType(StatusCodes.Status200OK)]
    // [ProducesResponseType(StatusCodes.Status404NotFound)]
    // public async Task<ActionResult<FullDetailsModel>> GetForSensorTopOne(int? sensorId, int? deviceId)
    // {
    //     // Start with the base query
    //     IQueryable<SensorData> query = _dbContext.SensorsData
    //         .Include(sd => sd.SensorDevice)
    //         .ThenInclude(sd => sd.Sensor)
    //         .Include(sd => sd.SensorDevice)
    //         .ThenInclude(sd => sd.Device);
    //
    //     // Apply filters based on the presence of sensorId and deviceId
    //     if (sensorId.HasValue)
    //     {
    //         query = query.Where(sd => sd.SensorDevice.SensorId == sensorId.Value);
    //     }
    //     if (deviceId.HasValue)
    //     {
    //         query = query.Where(sd => sd.SensorDevice.Device.Id == deviceId.Value);
    //     }
    //
    //     // Fetch the data
    //     var sensorData = await query
    //         .OrderBy(sd => sd.RecordDate)
    //         .ToListAsync();
    //
    //     // Return 404 if no data found
    //     if (!sensorData.Any())
    //     {
    //         return NotFound();
    //     }
    //
    //     // Select the most recent sensor data entry
    //     var topSensorData = sensorData.Last(); // As it's ordered by RecordDate ascending
    //
    //     var model = new FullDetailsModel
    //     {
    //         Id = topSensorData.Id,
    //         SensorDevice = topSensorData.SensorDevice,
    //         Value = topSensorData.Value,
    //         RecordDate = topSensorData.RecordDate
    //     };
    //
    //     // Fetch all values for the given sensor up to the top sensor data's record date
    //     var valuesForStatistics = await query
    //         .Where(sd => sd.RecordDate <= topSensorData.RecordDate)
    //         .OrderByDescending(sd => sd.RecordDate)
    //         .Select(sd => sd.Value)
    //         .ToListAsync();
    //
    //     // Calculate statistics for the model
    //     model.CalculateStatistics(valuesForStatistics);
    //
    //     return Ok(model);
    // }

    [JsonSchema(Name = "SensorsDataFullDetailsModel")]
    public class FullDetailsModel
    {
        public int Id { get; set; }
        public SensorDevice SensorDevice { get; set; } = null!;
        public int SensorDeviceId { get; set; }
        public decimal? Value { get; set; }
        public LocalDate RecordDate { get; set; }
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
        public LocalDate? RecordDate { get; set; }
        public decimal Average { get; set; }
        public decimal Minimum { get; set; }
        public decimal Maximum { get; set; }
        public decimal Sum { get; set; }
    }

    #endregion
}