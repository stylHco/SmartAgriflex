using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Features.Devices;
using BeekeepingMonitoring.SpaBackend.Features.Sensors;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.SensorDevices;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/sensor-devices")]
[Authorize]
[AutoConstructor]
public partial class SensorDevicesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    #region Create

    [JsonSchema(Name = "SensorDeviceCreateModel")]
    public class CreateModel
    {
        public required int SensorId { get; set; }

        public required int DeviceId { get; set; }

        [MaxLength(250)]
        public required string? Comments { get; set; }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> Create(CreateModel model)
    {
        Sensor? sensor = await _dbContext.Sensors.FirstOrDefaultAsync(s => s.Id == model.SensorId);
        if (sensor == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.SensorId,
                "Sensor not found"
            );
        }

        Device? device = await _dbContext.Devices.FirstOrDefaultAsync(d => d.Id == model.DeviceId);
        if (device == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.DeviceId,
                "Device not found"
            );
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem();
        }

        SensorDevice sensorDevice = _mapper.Map<SensorDevice>(model);

        _dbContext.SensorDevices.Add(sensorDevice);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = sensorDevice.Id }, sensorDevice.Id);
    }

    #endregion

    #region List

    [HttpGet]
    public async Task<IEnumerable<ListModel>> List()
    {
        return await _dbContext.SensorDevices
            .ProjectTo<ListModel>(_mapper)
            .ToArrayAsync();
    }

    [JsonSchema(Name = "SensorDevicesListModel")]
    public class ListModel
    {
        public required int Id { get; set; }

        public required SensorReferenceModel Sensor { get; set; }

        public required DeviceReferenceModel Device { get; set; }

        [MaxLength(250)]
        public required string? Comments { get; set; }
    }

    #endregion

    #region ListForReference

    [HttpGet("for-reference")]
    public async Task<IEnumerable<SensorDeviceReferenceModel>> ListForReference()
    {
        return await _dbContext.SensorDevices
            .ProjectTo<SensorDeviceReferenceModel>(_mapper)
            .ToArrayAsync();
    }

    #endregion

    #region Get

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DetailsModel>> Get(int id)
    {
        DetailsModel? model = await _dbContext.SensorDevices
            .Where(s => s.Id == id)
            .ProjectTo<DetailsModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "SensorDeviceDetailsModel")]
    public class DetailsModel
    {
        public required int Id { get; set; }

        public required SensorReferenceModel Sensor { get; set; }

        public required DeviceReferenceModel Device { get; set; }

        [MaxLength(250)]
        public required string? Comments { get; set; }
    }

    #endregion

    #region Update

    [HttpGet("{id:int}/for-update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UpdateModel>> GetForUpdate(int id)
    {
        UpdateModel? model = await _dbContext.SensorDevices
            .Where(s => s.Id == id)
            .ProjectTo<UpdateModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "SensorDeviceUpdateModel")]
    public class UpdateModel
    {
        public required int SensorId { get; set; }

        public required int DeviceId { get; set; }

        [MaxLength(250)]
        public required string? Comments { get; set; }
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UpdateModel>> Update(int id, UpdateModel model)
    {
        SensorDevice? sensorDevice = await _dbContext.SensorDevices
            .SingleOrDefaultAsync(s => s.Id == id);

        if (sensorDevice == null) return NotFound();

        Sensor? sensor = await _dbContext.Sensors.FirstOrDefaultAsync(s => s.Id == model.SensorId);
        if (sensor == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.SensorId,
                "Sensor not found"
            );
        }

        Device? device = await _dbContext.Devices.FirstOrDefaultAsync(d => d.Id == model.DeviceId);
        if (device == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.DeviceId,
                "Device not found"
            );
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem();
        }

        _mapper.Map(model, sensorDevice);

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict();
        }

        return Ok(_mapper.Map<UpdateModel>(sensorDevice));
    }

    #endregion

    #region Delete

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        SensorDevice? sensorDevice = await _dbContext.SensorDevices
            .SingleOrDefaultAsync(s => s.Id == id);

        if (sensorDevice == null)
        {
            return NotFound();
        }

        _dbContext.SensorDevices.Remove(sensorDevice);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    #endregion
}