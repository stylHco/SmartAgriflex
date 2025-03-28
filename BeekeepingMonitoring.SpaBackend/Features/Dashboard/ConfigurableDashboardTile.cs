using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeekeepingMonitoring.SpaBackend.Features.Dashboard;

public class ConfigurableDashboardTile
{
    public long Id { get; init; }

    public ConfigurableDashboard? Dashboard { get; set; }
    public int ConfigurableDashboardId { get; set; }

    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }

    public ConfDashboardTileType Type { get; set; }

    public PredefinedVisualizationTileOptions? PredefinedVisualizationOptions { get; set; }
}

// Underlying values are persisted to the database, hence must never change
public enum ConfDashboardTileType
{
    DummyText = 0,
    PredefinedVisualization = 1,
}

public class ConfigurableDashboardTileEntityConfiguration : IEntityTypeConfiguration<ConfigurableDashboardTile>
{
    public void Configure(EntityTypeBuilder<ConfigurableDashboardTile> builder)
    {
        builder.OwnsOne(tile => tile.PredefinedVisualizationOptions);
    }
}