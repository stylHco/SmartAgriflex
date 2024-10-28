import {ICommonChartWrapper} from "../common-chart.structures";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {getDefaultOrFirstSeries} from "./shared";
import {DEFAULT_SERIES_VALUE} from "../common-viz-data";
import {configureCommonXyChart, SimpleXySeriesDataSetter} from "./xy.common";
import {configureLineSeries} from "./line.chart";

export type TimeLineChartOptions = {
  datasetKey?: string;

  dateAxisField?: string;

  /**
   * Overrides the interval set in data descriptor
   */
  baseInterval?: am5.time.ITimeInterval;
};

// TODO: pull more of this out to common
export function configureTimeLineChart(wrapper: ICommonChartWrapper, options: TimeLineChartOptions): void {
  const xyContext = configureCommonXyChart(wrapper, {
    baseAxisDataset: options.datasetKey,
    baseAxisField: options.dateAxisField,
    baseAxisBaseInterval: options.baseInterval,
  });

  const seriesDescriptorName = getDefaultOrFirstSeries(xyContext.baseAxisDatasetDescriptor);

  const root = wrapper.root;
  const chart = xyContext.chart;

  chart.setAll({
    panX: true,
    panY: true,
    wheelX: 'panX',
    wheelY: 'zoomX',
    pinchZoomX: true,
  });

  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {
    behavior: 'none',
  }));
  cursor.lineY.set('visible', false);

  xyContext.baseAxis.setAll({
    maxDeviation: 0.2,
    tooltip: am5.Tooltip.new(root, {}),
  });

  const series = configureLineSeries(xyContext, {
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: seriesDescriptorName,
    valueFieldKey: DEFAULT_SERIES_VALUE,
  });

  series.set('tooltip', am5.Tooltip.new(root, {
    labelText: "{valueY}",
  }));

  const scrollbar = chart.set('scrollbarX', am5xy.XYChartScrollbar.new(root, {
    orientation: 'horizontal',
    height: 60,
  }));

  const sbDateAxis = scrollbar.chart.xAxes.push(am5xy.DateAxis.new(root, {
    renderer: am5xy.AxisRendererX.new(root, {}),

    baseInterval: (xyContext.baseAxis as am5xy.DateAxis<am5xy.AxisRenderer>)
      .get('baseInterval'),
  }));

  const sbValueAxis = scrollbar.chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
  }));

  const sbSeries = scrollbar.chart.series.push(am5xy.LineSeries.new(root, {
    valueYField: series.get('valueYField'),
    valueXField: series.get('valueXField'),

    xAxis: sbDateAxis,
    yAxis: sbValueAxis,
  }));

  wrapper.dataSetters.push(new SimpleXySeriesDataSetter(xyContext.baseAxisDataset, sbSeries));
}
