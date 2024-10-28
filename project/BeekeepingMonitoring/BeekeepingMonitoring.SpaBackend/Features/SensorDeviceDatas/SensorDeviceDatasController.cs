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
}