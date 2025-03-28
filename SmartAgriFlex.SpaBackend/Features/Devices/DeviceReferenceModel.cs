using System.ComponentModel.DataAnnotations;

namespace SmartAgriFlex.SpaBackend.Features.Devices;

public class DeviceReferenceModel
{
    public required int Id { get; set; }

    [MaxLength(500)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public required string? Nickname { get; set; }
}
