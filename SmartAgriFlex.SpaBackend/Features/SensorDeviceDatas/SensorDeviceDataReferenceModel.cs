using SmartAgriFlex.SpaBackend.Features.SensorDevices;
using NodaTime;

namespace SmartAgriFlex.SpaBackend.Features.SensorDeviceDatas;

public class SensorDeviceDataReferenceModel
{
    public required int Id { get; set; }
    
    public required SensorDeviceReferenceModel SensorDevice { get; set; }
    
    public required decimal? Value { get; set; }

    public required LocalDateTime RecordDate { get; set; }
    
}
