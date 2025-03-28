using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.Sensors;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/sensors")]
[Authorize]
[AutoConstructor]
public partial class SensorsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    #region Create

    [JsonSchema(Name = "SensorCreateModel")]
    public class CreateModel
    {
        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> Create(CreateModel model)
    {
        Sensor sensor = _mapper.Map<Sensor>(model);

        _dbContext.Sensors.Add(sensor);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = sensor.Id }, sensor.Id);
    }

    #endregion

    #region List

    [HttpGet]
    public async Task<IEnumerable<ListModel>> List()
    {
        return await _dbContext.Sensors
            .ProjectTo<ListModel>(_mapper)
            .ToArrayAsync();
    }

    [JsonSchema(Name = "SensorsListModel")]
    public class ListModel
    {
        public required int Id { get; set; }

        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }
    }

    #endregion

    #region ListForReference

    [HttpGet("for-reference")]
    public async Task<IEnumerable<SensorReferenceModel>> ListForReference()
    {
        return await _dbContext.Sensors
            .ProjectTo<SensorReferenceModel>(_mapper)
            .ToArrayAsync();
    }

    #endregion

    #region Get

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DetailsModel>> Get(int id)
    {
        DetailsModel? model = await _dbContext.Sensors
            .Where(s => s.Id == id)
            .ProjectTo<DetailsModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "SensorDetailsModel")]
    public class DetailsModel
    {
        public required int Id { get; set; }

        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }
    }

    #endregion

    #region Update

    [HttpGet("{id:int}/for-update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UpdateModel>> GetForUpdate(int id)
    {
        UpdateModel? model = await _dbContext.Sensors
            .Where(s => s.Id == id)
            .ProjectTo<UpdateModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "SensorUpdateModel")]
    public class UpdateModel
    {
        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UpdateModel>> Update(int id, UpdateModel model)
    {
        Sensor? sensor = await _dbContext.Sensors
            .SingleOrDefaultAsync(s => s.Id == id);

        if (sensor == null) return NotFound();

        _mapper.Map(model, sensor);

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict();
        }

        return Ok(_mapper.Map<UpdateModel>(sensor));
    }

    #endregion

    #region Delete

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        Sensor? sensor = await _dbContext.Sensors
            .SingleOrDefaultAsync(s => s.Id == id);

        if (sensor == null)
        {
            return NotFound();
        }

        _dbContext.Sensors.Remove(sensor);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    #endregion
}