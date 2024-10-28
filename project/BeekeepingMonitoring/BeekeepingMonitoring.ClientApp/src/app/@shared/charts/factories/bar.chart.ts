import {ICommonChartWrapper} from "../common-chart.structures";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {DEFAULT_SERIES} from "../common-viz-data";
import {getDefaultOrFirstSeries, TopLabelOptions} from "./shared";
import {
  configureCommonXyChart,
  configureCommonXyLegend,
  getXyCommonSeriesSettings,
  SimpleXySeriesDataSetter,
  XyCommonChartContext,
  XyCommonSeriesOptions
} from "./xy.common";

export type BarChartOptions = {
  datasetKey?: string;

  categoryField?: string;
  series?: BarChartSeriesOptions[];

  isHorizontal?: boolean;
  isLayered?: boolean;
  isStacked?: boolean;

  enableLegend?: boolean;

  label?: TopLabelOptions;
}

export type BarChartSeriesOptions = {
  datasetKey?: string;

  descriptorName: string;
  displayName?: string;
};

function getSeriesOptions(xyContext: XyCommonChartContext, options: BarChartOptions): BarChartSeriesOptions[] {
  if (options.series) return options.series;

  const series = getDefaultOrFirstSeries(xyContext.baseAxisDatasetDescriptor);

  return [{
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: series,
    displayName: series === DEFAULT_SERIES ? undefined : series,
  }];
}

export function configureBarChart(wrapper: ICommonChartWrapper, options: BarChartOptions): void {
  const xyContext = configureCommonXyChart(wrapper, {
    baseAxisDataset: options.datasetKey,
    baseAxisField: options.categoryField,
    isBaseAxisVertical: options.isHorizontal,
    label: options.label,
  });

  const seriesOptions = getSeriesOptions(xyContext, options);
  const enableLegend = options.enableLegend ?? seriesOptions.length > 1;
  const isLayered = options.isLayered ?? false;
  const isStacked = options.isStacked ?? false;

  for (const seriesOption of seriesOptions) {
    configureBarSeries(xyContext, {
      datasetKey: seriesOption.datasetKey ?? xyContext.baseAxisDataset,
      descriptorName: seriesOption.descriptorName,
      displayName: seriesOption.displayName,
      isLayered: isLayered,
      isStacked: isStacked,

      defaultTooltip: seriesOptions.length === 1,
    });
  }

  if (enableLegend) {
    configureCommonXyLegend(xyContext);
  }
}

export type IndividualBarSeriesOptions = XyCommonSeriesOptions & {
  isLayered?: boolean;
  isStacked?: boolean;

  /**
   * If not set and isLayered is true, will be calculated as
   * (80 - number of preceding layered bar series * 10)%
   */
  columnWidth?: number | am5.Percent;

  defaultTooltip?: boolean;
};

export function configureBarSeries(
  xyContext: XyCommonChartContext,
  options: IndividualBarSeriesOptions,
): am5xy.ColumnSeries {
  const isLayered = options.isLayered ?? false;
  const isStacked = options.isStacked ?? false;

  const root = xyContext.wrapper.root;
  const chart = xyContext.chart;

  const series = am5xy.ColumnSeries.new(root, {
    ...getXyCommonSeriesSettings(xyContext, options),

    clustered: !isLayered,
    stacked: isStacked,
  });

  // TODO: same for line?
  if (options.defaultTooltip) {
    const tooltipValueSource = xyContext.isBaseAxisVertical ? 'valueX' : 'valueY';

    series.set('tooltip', am5.Tooltip.new(root, {
      labelText: '{' + tooltipValueSource + '}',
      pointerOrientation: xyContext.isBaseAxisVertical ? 'left' : undefined,
    }));
  }

  chart.series.push(series);

  let columnWidth: number | am5.Percent | undefined;
  if (options.columnWidth) {
    columnWidth = options.columnWidth;
  } else if (isLayered) {
    let precedingLayersCount = 0;

    for (const otherSeries of chart.series) {
      if (otherSeries === series) break;

      if (!(otherSeries instanceof am5xy.ColumnSeries)) continue;
      if (otherSeries.get('clustered')) continue;

      precedingLayersCount++;
    }

    columnWidth = am5.percent(80 - precedingLayersCount * 10);
  }

  if (columnWidth) {
    series.columns.template.set('width', columnWidth);
  }

  xyContext.wrapper.dataSetters.push(new SimpleXySeriesDataSetter(options.datasetKey, series));

  return series;
}
