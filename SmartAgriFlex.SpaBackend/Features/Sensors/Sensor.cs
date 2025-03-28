using System.ComponentModel.DataAnnotations;

namespace SmartAgriFlex.SpaBackend.Features.Sensors;

public record SensorIdentifier
{
    public required int Id { get; init; }

    public static implicit operator SensorIdentifier(Sensor sensor) => new()
    {
        Id = sensor.Id,
    };
}

public class Sensor
{
    public Sensor()
    {
    }

    public Sensor(SensorIdentifier identifier)
    {
        Id = identifier.Id;
    }

    public int Id { get; set; }

    [MaxLength(500)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public required string? Description { get; set; }
}
