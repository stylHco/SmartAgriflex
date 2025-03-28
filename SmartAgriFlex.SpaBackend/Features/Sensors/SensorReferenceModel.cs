using System.ComponentModel.DataAnnotations;

namespace SmartAgriFlex.SpaBackend.Features.Sensors;

public class SensorReferenceModel
{
    public required int Id { get; set; }

    [MaxLength(500)]
    public required string Name { get; set; }
    
    public required string? Description { get; set; }
}
