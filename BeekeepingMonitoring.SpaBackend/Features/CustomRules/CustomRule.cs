using System.ComponentModel.DataAnnotations;
using BeekeepingMonitoring.SpaBackend.Features.Sensors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeekeepingMonitoring.SpaBackend.Features.CustomRules;

public record CustomRuleIdentifier
{
    public required int Id { get; init; }

    public static implicit operator CustomRuleIdentifier(CustomRule customRule) => new()
    {
        Id = customRule.Id,
    };
}

public class CustomRule
{
    public CustomRule()
    {
    }

    public CustomRule(CustomRuleIdentifier identifier)
    {
        Id = identifier.Id;
    }

    public int Id { get; set; }

    public Sensor Sensor { get; set; } = null!;
    public int SensorId { get; set; }
    
    public required decimal? Min { get; set; }
    
    public required decimal? Max { get; set; }
    
    [MaxLength(100)]
    public required string? ProgramDirective { get; set; }
    
    [MaxLength(450)]
    public required string? RuleText { get; set; }
}

public class CustomRuleEntityConfiguration : IEntityTypeConfiguration<CustomRule>
{
    public void Configure(EntityTypeBuilder<CustomRule> builder)
    {
        builder.Property(s => s.Min)
            .HasPrecision(15, 3);
        
        builder.Property(s => s.Max)
            .HasPrecision(15, 3);
    }
}
