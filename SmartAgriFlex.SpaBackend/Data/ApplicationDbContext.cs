using System;
using SmartAgriFlex.SpaBackend.Features.CustomRules;
using SmartAgriFlex.SpaBackend.Features.Dashboard;
using SmartAgriFlex.SpaBackend.Features.Identity;
using SmartAgriFlex.SpaBackend.Features.Devices;
using SmartAgriFlex.SpaBackend.Features.Sensors;
using SmartAgriFlex.SpaBackend.Features.SensorDevices;
using SmartAgriFlex.SpaBackend.Features.SensorDeviceDatas;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace SmartAgriFlex.SpaBackend.Data;

public class ApplicationDbContext : IdentityUserContext<ApplicationUser, Guid>
{
    public ApplicationDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Device> Devices { get; set; } = null!;
    public DbSet<Sensor> Sensors { get; set; } = null!;
    public DbSet<SensorDevice> SensorDevices { get; set; } = null!;
    public DbSet<SensorDeviceData> SensorDeviceDatas { get; set; } = null!;
    public DbSet<CustomRule> CustomRules { get; set; } = null!;

    // Add DbSet<>s for your entities

    public DbSet<ConfigurableDashboard> ConfigurableDashboards { get; set; } = null!;
    public DbSet<ConfigurableDashboardTile> ConfigurableDashboardTiles { get; set; } = null!;

    public DbSet<SalesRecord> Sales { get; set; } = null!;
    public required DbSet<AssociationRuleRecord> MinerAssocRules { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
