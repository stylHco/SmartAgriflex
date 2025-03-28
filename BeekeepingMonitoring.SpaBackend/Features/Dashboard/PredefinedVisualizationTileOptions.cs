namespace BeekeepingMonitoring.SpaBackend.Features.Dashboard;

public class PredefinedVisualizationTileOptions
{
    public PredefinedVisualizationType Type { get; set; }
}

// Underlying values are persisted to the database, hence must never change
public enum PredefinedVisualizationType
{
    BasicPie = 0,
    BasicDonut = 1,
    BasicBar = 2,
    HorizontalBar = 3,
    BasicHeatMap = 4,
    SemiPie = 5,
    BasicRadar = 6,
    BasicLine = 7,
    DualLine = 8,
    NestedDonut = 9,
    MultiBar = 10,
    LayeredBar = 11,
    BasicBoxplot = 12,
    BasicTimeLine = 13,
    BasicCyprusMap = 14,
    BasicBullet = 15,
    BasicPareto = 16,
    StackedBar = 17,
    ComboLineBar = 18,
    ComboLineBarRotated = 19,
    HorizontalBoxplot = 20,
    ComboLineBox = 21,
    BasicSunburstChart = 22,
    BasicTreeMap = 23,
    BasicPartitionChart = 24,
    RulesSupportConfidence = 25,
    RulesSupportConfidenceLift = 26,
    RulesMatrix = 27,
    AssociationRules = 28,
}
