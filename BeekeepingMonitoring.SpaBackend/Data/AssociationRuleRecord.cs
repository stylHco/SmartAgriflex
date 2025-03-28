using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeekeepingMonitoring.SpaBackend.Data;

public record AssociationRuleRecord
{
    public required string Rule { get; init; }

    public required string LeftHand { get; init; }
    public required string RightHand { get; init; }

    public required int Relations { get; init; }

    public required double Confidence { get; init; }
    public required double Support { get; init; }
    public required double Lift { get; init; }
}

public class RulesSupportConfidenceDataEntityConfiguration : IEntityTypeConfiguration<AssociationRuleRecord>
{
    public void Configure(EntityTypeBuilder<AssociationRuleRecord> builder)
    {
        builder.ToTable("MinerAssocRules", tableBuilder => tableBuilder.ExcludeFromMigrations());
        builder.HasNoKey();

        builder.Property(dto => dto.Rule).HasColumnName("RULE");
        builder.Property(dto => dto.LeftHand).HasColumnName("_LHAND");
        builder.Property(dto => dto.RightHand).HasColumnName("_RHAND");
        builder.Property(dto => dto.Relations).HasColumnName("SET_SIZE");
        builder.Property(dto => dto.Confidence).HasColumnName("CONF");
        builder.Property(dto => dto.Support).HasColumnName("SUPPORT");
        builder.Property(dto => dto.Lift).HasColumnName("LIFT");
    }
}