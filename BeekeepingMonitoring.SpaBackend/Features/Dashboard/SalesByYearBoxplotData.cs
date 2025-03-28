using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeekeepingMonitoring.SpaBackend.Features.Dashboard;

public class SalesByYearBoxplotData
{
    public int Year { get; set; }

    public double Min { get; set; }
    public double Q1 { get; set; }
    public double Median { get; set; }
    public double Q3 { get; set; }
    public double Max { get; set; }

    public double TotalVolume { get; set; }
    
    public int Count { get; set; }
}

public class SalesByYearBoxplotDataEntityConfiguration : IEntityTypeConfiguration<SalesByYearBoxplotData>
{
    public void Configure(EntityTypeBuilder<SalesByYearBoxplotData> builder)
    {
        builder.QueryResultOnly();
    }
}