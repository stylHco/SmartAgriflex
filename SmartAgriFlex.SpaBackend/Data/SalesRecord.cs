using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SmartAgriFlex.SpaBackend.Data;

public class SalesRecord
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Day { get; set; }
    public int Quarter { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;

    public string Brand { get; set; } = null!;

    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;

    public string Promotion { get; set; } = null!;
    public string PackType { get; set; } = null!;
    public string Diet { get; set; } = null!;

    public int OutletId { get; set; }
    public string OutletName { get; set; } = null!;

    public int OutletTypeId { get; set; }
    public string OutletTypeName { get; set; } = null!;

    public int AreaId { get; set; }
    public string UrbanRural { get; set; } = null!;
    public int PAreaId { get; set; }

    public string AreaName { get; set; } = null!;

    public double Size { get; set; }
    public double? Price { get; set; }
    public double Quantity { get; set; }
    public double? SalesValue { get; set; }
    public double SalesVolume { get; set; }
}

internal class SalesRecordEntityTypeConfiguration : IEntityTypeConfiguration<SalesRecord>
{
    public void Configure(EntityTypeBuilder<SalesRecord> builder)
    {
        builder.ToTable("Sales");
        builder.HasNoKey();

        builder.Property(r => r.Year).HasColumnName("YEAR");
        builder.Property(r => r.Month).HasColumnName("MONTH");
        builder.Property(r => r.Day).HasColumnName("DAY");
        builder.Property(r => r.Quarter).HasColumnName("QUARTER");
        builder.Property(r => r.CategoryId).HasColumnName("CATEGORY_ID");
        builder.Property(r => r.CategoryName).HasColumnName("CATEGORY_NAME");
        builder.Property(r => r.Brand).HasColumnName("BRAND");
        builder.Property(r => r.ProductId).HasColumnName("PRODUCT_ID");
        builder.Property(r => r.ProductName).HasColumnName("PRODUCT_NAME");
        builder.Property(r => r.Promotion).HasColumnName("PROMOTION");
        builder.Property(r => r.PackType).HasColumnName("PACK_TYPE");
        builder.Property(r => r.Diet).HasColumnName("DIET");
        builder.Property(r => r.OutletId).HasColumnName("OUTLET_ID");
        builder.Property(r => r.OutletName).HasColumnName("OUTLET_NAME");
        builder.Property(r => r.OutletTypeId).HasColumnName("OUTLET_TYPE_ID");
        builder.Property(r => r.OutletTypeName).HasColumnName("OUTLET_TYPE_NAME");
        builder.Property(r => r.AreaId).HasColumnName("AREA_ID");
        builder.Property(r => r.UrbanRural).HasColumnName("URBAN_RURAL");
        builder.Property(r => r.PAreaId).HasColumnName("PAREA_ID");
        builder.Property(r => r.AreaName).HasColumnName("AREA_NAME");
        builder.Property(r => r.Size).HasColumnName("M_SIZE");
        builder.Property(r => r.Price).HasColumnName("M_PRICE");
        builder.Property(r => r.Quantity).HasColumnName("M_QUANTITY");
        builder.Property(r => r.SalesValue).HasColumnName("M_SALES_VALUE");
        builder.Property(r => r.SalesVolume).HasColumnName("M_SALES_VOLUME");

        foreach (IMutableProperty property in builder.Metadata.GetProperties())
        {
            if (property.ClrType != typeof(string)) continue;

            property.SetMaxLength(150);
        }
    }
}