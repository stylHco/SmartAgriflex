

using SmartAgriFlex.SpaBackend.Features.Devices;
using SmartAgriFlex.SpaBackend.Features.Sensors;

namespace SmartAgriFlex.SpaBackend.Features.SensorDevices;

public class SensorDeviceReferenceModel
{
    public required int Id { get; set; }
    public SensorReferenceModel Sensor { get; set; } = null!;
    public DeviceReferenceModel Device { get; set; } = null!;
}
