using System.ComponentModel.DataAnnotations;

namespace BeekeepingMonitoring.SpaBackend.Features.Sensors;

public class SensorReferenceModel
{
    public required int Id { get; set; }

    [MaxLength(500)]
    public required string Name { get; set; }
}
