import {ICommonChartDataSetter, ICommonChartWrapper} from "../common-chart.structures";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5 from "@amcharts/amcharts5";
import {getDefaultOrFirstDataset, getDefaultOrFirstSeries} from "./shared";
import {CommonVizDataContainer, CommonVizTabularDatasetDescriptor} from "../common-viz-data";

export interface BulletChartOptions {
  //
}

export const ACTUAL_VALUE = 'ACTUAL';
export const TARGET_VALUE = 'TARGET';

const colors = [
  am5.color(0x19d228),
  am5.color(0xb4dd1e),
  am5.color(0xf4fb16),
  am5.color(0xf6d32b),
  am5.color(0xfb7116),
];

export function configureBulletChart(wrapper: ICommonChartWrapper, options: BulletChartOptions): void {
  const datasetKey = getDefaultOrFirstDataset(wrapper.dataDescriptor);
  const datasetDescriptor = wrapper.dataDescriptor[datasetKey] as CommonVizTabularDatasetDescriptor;

  const categoryField = datasetDescriptor.keyFields[0];
  const valueSeriesDescriptor = datasetDescriptor.valueFields[getDefaultOrFirstSeries(datasetDescriptor)];

  const root = wrapper.root;

  const chart = wrapper.chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    wheelX: 'none',
    wheelY: 'none',
    arrangeTooltips: false,
  }));

  const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
    categoryField: categoryField,
    renderer: am5xy.AxisRendererY.new(root, {}),
  }));

  const xRenderer = am5xy.AxisRendererX.new(root, {});
  xRenderer.grid.template.set("forceHidden", true);

  const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
    renderer: xRenderer,
    min: 0,
    max: 100,
    numberFormat: "#.'%'",
  }));

  // Background
  const colorsCount = colors.length;
  for (let i = 0; i < colorsCount; i++) {
    let rangeDataItem = xAxis.makeDataItem({
      value: (i / colorsCount) * 100,
      endValue: ((i + 1) / colorsCount) * 100,
    });
    xAxis.createAxisRange(rangeDataItem);

    rangeDataItem.get("axisFill")!.setAll({
      visible: true,
      fill: colors[i],
      stroke: colors[i],
      fillOpacity: 1,
    });
  }

  const seriesActual = chart.series.push(am5xy.ColumnSeries.new(root, {
    xAxis: xAxis,
    yAxis: yAxis,

    valueXField: valueSeriesDescriptor[ACTUAL_VALUE],
    categoryYField: categoryField,

    fill: am5.color(0x000000),
    stroke: am5.color(0x000000),

    tooltip: am5.Tooltip.new(root, {
      pointerOrientation: "left",
      labelText: "{valueX}%",
    }),
  }));

  seriesActual.columns.template.setAll({
    height: am5.p50,
  });

  const seriesTarget = chart.series.push(am5xy.StepLineSeries.new(root, {
    xAxis: xAxis,
    yAxis: yAxis,

    valueXField: valueSeriesDescriptor[TARGET_VALUE],
    categoryYField: categoryField,

    stroke: am5.color(0x000000),
    fill: am5.color(0x000000),
    noRisers: true,
    stepWidth: am5.p50,

    tooltip: am5.Tooltip.new(root, {
      pointerOrientation: "left",
      labelText: "{valueX}%",
    }),
  }));

  seriesTarget.strokes.template.set("strokeWidth", 3);

  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {
    behavior: "none",
  }));
  cursor.lineY.set('visible', false);
  cursor.lineX.set('visible', false);

  wrapper.dataSetters.push(new BulletChartDataSetter(datasetKey, chart));
}

export class BulletChartDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly datasetKey: string,
    private readonly chart: am5xy.XYChart,
  ) {
  }

  setData(data: CommonVizDataContainer): void {
    this.chart.yAxes.each(s => s.data.setAll(data[this.datasetKey]));
    this.chart.series.each(s => s.data.setAll(data[this.datasetKey]));
  }
}
