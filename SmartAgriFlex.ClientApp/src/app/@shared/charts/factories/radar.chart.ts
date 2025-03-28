import {ICommonChartDataSetter, ICommonChartWrapper} from "../common-chart.structures";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import {CommonVizDataContainer, CommonVizTabularDatasetDescriptor, DEFAULT_SERIES_VALUE} from "../common-viz-data";
import {getDefaultOrFirstDataset, getDefaultOrFirstSeries} from "./shared";

export interface RadarChartOptions {
  //
}

export function configureRadarChart(wrapper: ICommonChartWrapper, options: RadarChartOptions): void {
  const datasetKey = getDefaultOrFirstDataset(wrapper.dataDescriptor);
  const datasetDescriptor = wrapper.dataDescriptor[datasetKey] as CommonVizTabularDatasetDescriptor;

  const categoryField = datasetDescriptor.keyFields[0];
  const valueField = datasetDescriptor.valueFields[getDefaultOrFirstSeries(datasetDescriptor)][DEFAULT_SERIES_VALUE];

  const root = wrapper.root;

  const chart = wrapper.chart = root.container.children.push(am5radar.RadarChart.new(root, {
    panX: false,
    panY: false,
    wheelX: 'panX',
    wheelY: 'zoomX',
  }));

  const cursor = chart.set('cursor', am5radar.RadarCursor.new(root, {
    behavior: 'zoomX',
  }));

  cursor.lineY.set('visible', false);

  const xRenderer = am5radar.AxisRendererCircular.new(root, {});
  xRenderer.labels.template.setAll({
    radius: 10,
  });

  const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
    maxDeviation: 0,
    categoryField: categoryField,
    renderer: xRenderer,
    tooltip: am5.Tooltip.new(root, {}),
  }));

  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5radar.AxisRendererRadial.new(root, {}),
  }));

  const series = chart.series.push(am5radar.RadarLineSeries.new(root, {
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: valueField,
    categoryXField: categoryField,
    tooltip: am5.Tooltip.new(root, {
      labelText: '{valueY}',
    }),
  }));

  series.strokes.template.setAll({
    strokeWidth: 2,
  });

  series.bullets.push(() => am5.Bullet.new(root, {
    sprite: am5.Circle.new(root, {
      radius: 5,
      fill: series.get('fill'),
    }),
  }));

  wrapper.dataSetters.push(new RadarChartDataSetter(datasetKey, chart));
}

export class RadarChartDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly datasetKey: string,
    private readonly chart: am5radar.RadarChart,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    this.chart.xAxes.each(s => s.data.setAll(data[this.datasetKey]));
    this.chart.series.each(s => s.data.setAll(data[this.datasetKey]));
  }
}
