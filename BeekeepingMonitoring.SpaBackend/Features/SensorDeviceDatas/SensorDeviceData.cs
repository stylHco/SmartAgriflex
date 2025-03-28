using BeekeepingMonitoring.SpaBackend.Features.SensorDevices;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NodaTime;

namespace BeekeepingMonitoring.SpaBackend.Features.SensorDeviceDatas;

public record SensorDeviceDataIdentifier
{
    public required int Id { get; init; }

    public static implicit operator SensorDeviceDataIdentifier(SensorDeviceData sensorDeviceData) => new()
    {
        Id = sensorDeviceData.Id,
    };
}

public class SensorDeviceData
{
    public SensorDeviceData()
    {
    }

    public SensorDeviceData(SensorDeviceDataIdentifier identifier)
    {
        Id = identifier.Id;
    }

    public int Id { get; set; }

    public SensorDevice SensorDevice { get; set; } = null!;
    public int SensorDeviceId { get; set; }

    public required decimal? Value { get; set; }

    public required LocalDateTime RecordDate { get; set; }
}

public class SensorDeviceDataEntityConfiguration : IEntityTypeConfiguration<SensorDeviceData>
{
    public void Configure(EntityTypeBuilder<SensorDeviceData> builder)
    {
        builder.Property(s => s.Value)
            .HasPrecision(15, 3);
    }
}
