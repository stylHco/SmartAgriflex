import * as am5xy from "@amcharts/amcharts5/xy";
import {ICommonChartWrapper} from "../common-chart.structures";
import {DEFAULT_SERIES} from "../common-viz-data";
import {getDefaultOrFirstSeries} from "./shared";
import {
  configureCommonXyChart,
  configureCommonXyLegend,
  getXyCommonSeriesSettings,
  SimpleXySeriesDataSetter,
  XyCommonChartContext, XyCommonSeriesOptions
} from "./xy.common";

export type LineChartSeriesOptions = {
  datasetKey?: string;

  descriptorName: string;
  displayName?: string;

  enableArea?: boolean;
};

export type LineChartOptions = {
  datasetKey?: string;

  series?: LineChartSeriesOptions[];

  enableArea?: boolean;
  enableLegend?: boolean;
}

function getSeriesOptions(xyContext: XyCommonChartContext, options: LineChartOptions): LineChartSeriesOptions[] {
  if (options.series) return options.series;

  const series = getDefaultOrFirstSeries(xyContext.baseAxisDatasetDescriptor);

  return [{
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: series,
    displayName: series === DEFAULT_SERIES ? undefined : series,
  }];
}

export function configureLineChart(wrapper: ICommonChartWrapper, options: LineChartOptions): void {
  const xyContext = configureCommonXyChart(wrapper, {
    baseAxisDataset: options.datasetKey,
  });

  const seriesOptions = getSeriesOptions(xyContext, options);
  const enableLegend = options.enableLegend ?? seriesOptions.length > 1;

  for (const seriesOption of seriesOptions) {
    configureLineSeries(xyContext, {
      datasetKey: seriesOption.datasetKey ?? xyContext.baseAxisDataset,
      descriptorName: seriesOption.descriptorName,
      displayName: seriesOption.displayName,
      enableArea: seriesOption.enableArea ?? options.enableArea,
    });
  }

  if (enableLegend) {
    configureCommonXyLegend(xyContext);
  }
}

export type IndividualLineSeriesOptions = XyCommonSeriesOptions & {
  enableArea?: boolean;
};

export function configureLineSeries(
  xyContext: XyCommonChartContext,
  options: IndividualLineSeriesOptions,
): am5xy.LineSeries {
  const root = xyContext.wrapper.root;
  const chart = xyContext.chart;

  const series = am5xy.LineSeries.new(root, {
    ...getXyCommonSeriesSettings(xyContext, options),
  });

  chart.series.push(series);

  if (options.enableArea ?? false) {
    series.fills.template.setAll({
      fillOpacity: 0.2,
      visible: true,
    });
  }

  xyContext.wrapper.dataSetters.push(new SimpleXySeriesDataSetter(options.datasetKey, series));

  return series;
}
