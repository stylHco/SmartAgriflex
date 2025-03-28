using System.Collections.Generic;

namespace BeekeepingMonitoring.SpaBackend.DataVisualization;

public static class DataVisualizationHelpers
{
    /// <summary>
    /// Wraps a single dataset into a key -> dataset dictionary, using the default key.
    /// See common-viz-data.ts for more info.
    /// </summary>
    public static Dictionary<string, object> WrapDefaultDataset(object dataset)
        => new()
        {
            [DataVisualizationConstants.DefaultDatasetKey] = dataset,
        };   
}