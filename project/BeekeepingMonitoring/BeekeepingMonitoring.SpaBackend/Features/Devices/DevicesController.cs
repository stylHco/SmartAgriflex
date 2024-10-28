using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.Devices;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/devices")]
[Authorize]
[AutoConstructor]
public partial class DevicesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    #region Create

    [JsonSchema(Name = "DeviceCreateModel")]
    public class CreateModel
    {
        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Nickname { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }

        [MaxLength(250)]
        public required string? Model { get; set; }

        public required decimal? Latitude { get; set; }

        public required decimal? Longitude { get; set; }

        public required DateTimeOffset? InstalledDate { get; set; }

        [MaxLength(250)]
        public required string? Uid { get; set; }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> Create(CreateModel model)
    {
        Device device = _mapper.Map<Device>(model);

        _dbContext.Devices.Add(device);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = device.Id }, device.Id);
    }

    #endregion

    #region List

    [HttpGet]
    public async Task<IEnumerable<ListModel>> List()
    {
        return await _dbContext.Devices
            .ProjectTo<ListModel>(_mapper)
            .ToArrayAsync();
    }

    [JsonSchema(Name = "DevicesListModel")]
    public class ListModel
    {
        public required int Id { get; set; }

        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Nickname { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }

        [MaxLength(250)]
        public required string? Model { get; set; }

        public required decimal? Latitude { get; set; }

        public required decimal? Longitude { get; set; }

        public required DateTimeOffset? InstalledDate { get; set; }

        [MaxLength(250)]
        public required string? Uid { get; set; }
    }

    #endregion

    #region ListForReference

    [HttpGet("for-reference")]
    public async Task<IEnumerable<DeviceReferenceModel>> ListForReference()
    {
        return await _dbContext.Devices
            .ProjectTo<DeviceReferenceModel>(_mapper)
            .ToArrayAsync();
    }

    #endregion

    #region Get

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DetailsModel>> Get(int id)
    {
        DetailsModel? model = await _dbContext.Devices
            .Where(d => d.Id == id)
            .ProjectTo<DetailsModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "DeviceDetailsModel")]
    public class DetailsModel
    {
        public required int Id { get; set; }

        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Nickname { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }

        [MaxLength(250)]
        public required string? Model { get; set; }

        public required decimal? Latitude { get; set; }

        public required decimal? Longitude { get; set; }

        public required DateTimeOffset? InstalledDate { get; set; }

        [MaxLength(250)]
        public required string? Uid { get; set; }
    }

    #endregion

    #region Update

    [HttpGet("{id:int}/for-update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UpdateModel>> GetForUpdate(int id)
    {
        UpdateModel? model = await _dbContext.Devices
            .Where(d => d.Id == id)
            .ProjectTo<UpdateModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "DeviceUpdateModel")]
    public class UpdateModel
    {
        [MaxLength(500)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public required string? Nickname { get; set; }

        [MaxLength(500)]
        public required string? Description { get; set; }

        [MaxLength(250)]
        public required string? Model { get; set; }

        public required decimal? Latitude { get; set; }

        public required decimal? Longitude { get; set; }

        public required DateTimeOffset? InstalledDate { get; set; }

        [MaxLength(250)]
        public required string? Uid { get; set; }
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UpdateModel>> Update(int id, UpdateModel model)
    {
        Device? device = await _dbContext.Devices
            .SingleOrDefaultAsync(d => d.Id == id);

        if (device == null) return NotFound();

        _mapper.Map(model, device);

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict();
        }

        return Ok(_mapper.Map<UpdateModel>(device));
    }

    #endregion

    #region Delete

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        Device? device = await _dbContext.Devices
            .SingleOrDefaultAsync(d => d.Id == id);

        if (device == null)
        {
            return NotFound();
        }

        _dbContext.Devices.Remove(device);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    #endregion

    #region CheckUnique

    [HttpPost("check-unique/uid")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public Task<ActionResult> CheckUniqueUid(
        int? currentId, [BindRequired] string uid
    )
    {
        return CheckUniqueCommon(currentId, d => d.Uid == uid);
    }

    private async Task<ActionResult> CheckUniqueCommon(
        int? currentId,
        Expression<Func<Device, bool>> filter
    )
    {
        IQueryable<Device> query = _dbContext.Devices
            .Where(filter);

        if (currentId != null)
        {
            query = query
                .Where(d => d.Id != currentId);
        }

        return await query.AnyAsync()
            ? Conflict()
            : Ok();
    }

    #endregion
}