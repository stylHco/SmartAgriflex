using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using SmartAgriFlex.SpaBackend.Data;
using SmartAgriFlex.SpaBackend.Features.Sensors;
using SmartAgriFlex.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;

namespace SmartAgriFlex.SpaBackend.Features.CustomRules;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/custom-rules")]
[Authorize]
[AutoConstructor]
public partial class CustomRulesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    #region Create

    [JsonSchema(Name = "CustomRuleCreateModel")]
    public class CreateModel
    {
        public int SensorId { get; set; }
    
        public required decimal? Min { get; set; }
    
        public required decimal? Max { get; set; }
    
        [MaxLength(100)]
        public required string? ProgramDirective { get; set; }
    
        [MaxLength(450)]
        public required string? RuleText { get; set; }
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
        
        if (!ModelState.IsValid)
        {
            return ValidationProblem();
        }

        CustomRule customRule = _mapper.Map<CustomRule>(model);

        _dbContext.CustomRules.Add(customRule);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = customRule.Id }, customRule.Id);
    }

    #endregion

    #region List

    [HttpGet]
    public async Task<IEnumerable<ListModel>> List()
    {
        return await _dbContext.CustomRules
            .ProjectTo<ListModel>(_mapper)
            .ToArrayAsync();
    }

    [JsonSchema(Name = "CustomRulesListModel")]
    public class ListModel
    {
        public required int Id { get; set; }

        public required SensorReferenceModel Sensor { get; set; }
    
        public required decimal? Min { get; set; }
    
        public required decimal? Max { get; set; }
    
        [MaxLength(100)]
        public required string? ProgramDirective { get; set; }
    
        [MaxLength(450)]
        public required string? RuleText { get; set; }
    }

    #endregion

    #region ListForReference

    [HttpGet("for-reference")]
    public async Task<IEnumerable<CustomRuleReferenceModel>> ListForReference()
    {
        return await _dbContext.CustomRules
            .ProjectTo<CustomRuleReferenceModel>(_mapper)
            .ToArrayAsync();
    }

    #endregion

    #region Get

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DetailsModel>> Get(int id)
    {
        DetailsModel? model = await _dbContext.CustomRules
            .Where(s => s.Id == id)
            .ProjectTo<DetailsModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "CustomRulesDetailsModel")]
    public class DetailsModel
    {
        public required int Id { get; set; }

        public required SensorReferenceModel Sensor { get; set; }
    
        public required decimal? Min { get; set; }
    
        public required decimal? Max { get; set; }
    
        [MaxLength(100)]
        public required string? ProgramDirective { get; set; }
    
        [MaxLength(450)]
        public required string? RuleText { get; set; }
    }

    #endregion

    #region Update

    [HttpGet("{id:int}/for-update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UpdateModel>> GetForUpdate(int id)
    {
        UpdateModel? model = await _dbContext.CustomRules
            .Where(s => s.Id == id)
            .ProjectTo<UpdateModel>(_mapper)
            .SingleOrDefaultAsync();

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [JsonSchema(Name = "CustomRuleUpdateModel")]
    public class UpdateModel
    {
        public required int SensorId { get; set; }
    
        public required decimal? Min { get; set; }
    
        public required decimal? Max { get; set; }
    
        [MaxLength(100)]
        public required string? ProgramDirective { get; set; }
    
        [MaxLength(450)]
        public required string? RuleText { get; set; }
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UpdateModel>> Update(int id, UpdateModel model)
    {
        CustomRule? customRule = await _dbContext.CustomRules
            .SingleOrDefaultAsync(s => s.Id == id);

        if (customRule == null) return NotFound();

        Sensor? sensor = await _dbContext.Sensors.FirstOrDefaultAsync(s => s.Id == model.SensorId);
        if (sensor == null)
        {
            ModelState.AddModelError<CreateModel>(
                m => m.SensorId,
                "Sensor not found"
            );
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem();
        }

        _mapper.Map(model, customRule);

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict();
        }

        return Ok(_mapper.Map<UpdateModel>(customRule));
    }

    #endregion

    #region Delete

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        CustomRule? customRule = await _dbContext.CustomRules
            .SingleOrDefaultAsync(s => s.Id == id);

        if (customRule == null)
        {
            return NotFound();
        }

        _dbContext.CustomRules.Remove(customRule);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    #endregion
}