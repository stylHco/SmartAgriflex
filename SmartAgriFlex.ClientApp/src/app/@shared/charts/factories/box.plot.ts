import {ICommonChartWrapper} from "../common-chart.structures";
import {DEFAULT_SERIES, DEFAULT_SERIES_VALUE} from "../common-viz-data";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {
  configureCommonXyChart, getSingleValueXySeriesFieldSettings,
  getXySeriesAxesSettings,
  getXySeriesBaseFieldSettings,
  MaybeOppositeAxisSeriesOptions,
  SimpleXySeriesDataSetter,
  XyCommonChartContext
} from "./xy.common";

export const MIN_VALUE = 'MIN';
export const Q1_VALUE = 'Q1';
export const MEDIAN_VALUE = 'MEDIAN';
export const Q3_VALUE = 'Q3';
export const MAX_VALUE = 'MAX';
export const COUNT_VALUE = 'COUNT';

// TODO: bring this on par with options of other series types

export type BoxPlotOptions = {
  isHorizontal?: boolean;

  outliersDatasetKey?: string;
};

export function configureBoxPlot(wrapper: ICommonChartWrapper, options: BoxPlotOptions): void {
  const xyContext = configureCommonXyChart(wrapper, {
    isBaseAxisVertical: options.isHorizontal,
  });

  xyContext.chart.set('wheelY', xyContext.isBaseAxisVertical ? 'zoomX' : 'zoomY');

  configureBoxSeries(xyContext, {
    descriptorName: DEFAULT_SERIES,
  });

  if (!options.outliersDatasetKey) return;

  const root = wrapper.root;

  const outlierSeries = xyContext.chart.series.push(am5xy.LineSeries.new(root, {
    ...getXySeriesAxesSettings(xyContext, false),
    ...getSingleValueXySeriesFieldSettings(xyContext, {
      descriptorName: DEFAULT_SERIES,
      datasetKey: options.outliersDatasetKey,
      valueFieldKey: DEFAULT_SERIES_VALUE,
    }),
  }));

  outlierSeries.bullets.push(() => {
    const graphics = am5.Circle.new(root, {
      fill: outlierSeries.get('fill'),
      radius: 4,
    });

    return am5.Bullet.new(root, {
      sprite: graphics,
    });
  });

  outlierSeries.strokes.template.set('strokeOpacity', 0);

  xyContext.wrapper.dataSetters.push(new SimpleXySeriesDataSetter(options.outliersDatasetKey, outlierSeries));
}

export type IndividualBoxSeriesOptions = MaybeOppositeAxisSeriesOptions & {
  descriptorName: string;
};

/**
 * Important: do not apply legend to a chart with box series - box series do not
 * properly support the legend (am5charts limitation/oversight).
 */
export function configureBoxSeries(
  xyContext: XyCommonChartContext,
  options: IndividualBoxSeriesOptions,
): { candlestick: am5xy.CandlestickSeries, mediana: am5xy.StepLineSeries } {
  const valueSeriesDescriptor = xyContext.baseAxisDatasetDescriptor.valueFields[options.descriptorName];

  const root = xyContext.wrapper.root;
  const chart = xyContext.chart;

  const color = root.interfaceColors.get("background");
  const axesAndBaseFieldSettings = {
    ...getXySeriesAxesSettings(xyContext, options.oppositeAxis ?? false),
    ...getXySeriesBaseFieldSettings(xyContext),
  };

  const candlestick = chart.series.push(am5xy.CandlestickSeries.new(root, {
    ...axesAndBaseFieldSettings,

    valueYField: !xyContext.isBaseAxisVertical ? valueSeriesDescriptor[Q1_VALUE] : undefined,
    openValueYField: !xyContext.isBaseAxisVertical ? valueSeriesDescriptor[Q3_VALUE] : undefined,
    lowValueYField: !xyContext.isBaseAxisVertical ? valueSeriesDescriptor[MIN_VALUE] : undefined,
    highValueYField: !xyContext.isBaseAxisVertical ? valueSeriesDescriptor[MAX_VALUE] : undefined,

    valueXField: xyContext.isBaseAxisVertical ? valueSeriesDescriptor[Q1_VALUE] : undefined,
    openValueXField: xyContext.isBaseAxisVertical ? valueSeriesDescriptor[Q3_VALUE] : undefined,
    lowValueXField: xyContext.isBaseAxisVertical ? valueSeriesDescriptor[MIN_VALUE] : undefined,
    highValueXField: xyContext.isBaseAxisVertical ? valueSeriesDescriptor[MAX_VALUE] : undefined,

    fill: color,
    stroke: color,
  }));

  const mediana = chart.series.push(am5xy.StepLineSeries.new(root, {
    ...axesAndBaseFieldSettings,

    valueYField: !xyContext.isBaseAxisVertical ? valueSeriesDescriptor[MEDIAN_VALUE] : undefined,
    valueXField: xyContext.isBaseAxisVertical ? valueSeriesDescriptor[MEDIAN_VALUE] : undefined,

    stroke: color,
    noRisers: true,
  }));

  xyContext.wrapper.dataSetters.push(new SimpleXySeriesDataSetter(xyContext.baseAxisDataset, candlestick));
  xyContext.wrapper.dataSetters.push(new SimpleXySeriesDataSetter(xyContext.baseAxisDataset, mediana));

  return {candlestick, mediana};
}
