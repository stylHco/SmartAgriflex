using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NodaTime;

namespace BeekeepingMonitoring.SpaBackend.Features.Devices;

public record DeviceIdentifier
{
    public required int Id { get; init; }

    public static implicit operator DeviceIdentifier(Device device) => new()
    {
        Id = device.Id,
    };
}

public class Device
{
    public Device()
    {
    }

    public Device(DeviceIdentifier identifier)
    {
        Id = identifier.Id;
    }

    public int Id { get; set; }

    [MaxLength(500)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public required string? Nickname { get; set; }

    [MaxLength(500)]
    public required string? Description { get; set; }

    [MaxLength(250)]
    public required string? Model { get; set; }

    public required decimal? Latitude { get; set; }

    public required decimal? Longitude { get; set; }

    public required LocalDateTime? InstalledDate { get; set; }

    [MaxLength(250)]
    public required string? Uid { get; set; }
}

public class DeviceEntityConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        builder.Property(d => d.Latitude)
            .HasPrecision(15, 3);

        builder.Property(d => d.Longitude)
            .HasPrecision(15, 3);

        builder.HasIndex(entity => entity.Uid)
            .IsUnique();
    }
}
