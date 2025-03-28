using System.ComponentModel.DataAnnotations;
using SmartAgriFlex.SpaBackend.Features.Devices;
using SmartAgriFlex.SpaBackend.Features.Sensors;

namespace SmartAgriFlex.SpaBackend.Features.SensorDevices;

public record SensorDeviceIdentifier
{
    public required int Id { get; init; }

    public static implicit operator SensorDeviceIdentifier(SensorDevice sensorDevice) => new()
    {
        Id = sensorDevice.Id,
    };
}

public class SensorDevice
{
    public SensorDevice()
    {
    }

    public SensorDevice(SensorDeviceIdentifier identifier)
    {
        Id = identifier.Id;
    }

    public int Id { get; set; }

    public Sensor Sensor { get; set; } = null!;
    public int SensorId { get; set; }

    public Device Device { get; set; } = null!;
    public int DeviceId { get; set; }

    [MaxLength(250)]
    public required string? Comments { get; set; }
}
