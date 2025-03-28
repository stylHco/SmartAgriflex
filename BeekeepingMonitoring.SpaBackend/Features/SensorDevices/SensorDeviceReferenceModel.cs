

using BeekeepingMonitoring.SpaBackend.Features.Devices;
using BeekeepingMonitoring.SpaBackend.Features.Sensors;

namespace BeekeepingMonitoring.SpaBackend.Features.SensorDevices;

public class SensorDeviceReferenceModel
{
    public required int Id { get; set; }
    public SensorReferenceModel Sensor { get; set; } = null!;
    public DeviceReferenceModel Device { get; set; } = null!;
}
