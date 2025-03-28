using System.ComponentModel.DataAnnotations;
using SmartAgriFlex.SpaBackend.Features.Sensors;

namespace SmartAgriFlex.SpaBackend.Features.CustomRules;

public class CustomRuleReferenceModel
{
    public required int Id { get; set; }
    public SensorReferenceModel Sensor { get; set; } = null!;
    
    [MaxLength(100)]
    public required string? ProgramDirective { get; set; }
    
    [MaxLength(450)]
    public required string? RuleText { get; set; }
    
}
