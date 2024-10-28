import {ICommonChartDataSetter, ICommonChartWrapper} from "../common-chart.structures";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {
  CommonVizDataContainer,
  CommonVizTabularDataset,
  CommonVizTabularDatasetDescriptor,
  DEFAULT_SERIES_VALUE
} from "../common-viz-data";
import {distinctArray} from "../../utils/collection.helpers";
import {getDefaultOrFirstDataset, getDefaultOrFirstSeries} from "./shared";

export interface HeatMapOptions {
  //
}

export function configureHeatMap(wrapper: ICommonChartWrapper, options: HeatMapOptions): void {
  const datasetKey = getDefaultOrFirstDataset(wrapper.dataDescriptor);
  const datasetDescriptor = wrapper.dataDescriptor[datasetKey] as CommonVizTabularDatasetDescriptor;

  const xCategory = datasetDescriptor.keyFields[0];
  const yCategory = datasetDescriptor.keyFields[1];
  const valueField = datasetDescriptor.valueFields[getDefaultOrFirstSeries(datasetDescriptor)][DEFAULT_SERIES_VALUE];

  const root = wrapper.root;

  const chart = wrapper.chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    wheelX: "none",
    wheelY: "none",
    layout: root.verticalLayout,
  }));

  const yRenderer = am5xy.AxisRendererY.new(root, {
    visible: false,
    minGridDistance: 20,
    inversed: true,
  });

  yRenderer.grid.template.set("visible", false);

  const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
    maxDeviation: 0,
    renderer: yRenderer,
    categoryField: yCategory,
  }));

  const xRenderer = am5xy.AxisRendererX.new(root, {
    visible: false,
    minGridDistance: 30,
    opposite: true,
  });

  xRenderer.grid.template.set("visible", false);

  const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
    renderer: xRenderer,
    categoryField: xCategory,
  }));

  const series = chart.series.push(am5xy.ColumnSeries.new(root, {
    calculateAggregates: true,
    stroke: am5.color(0xffffff),
    clustered: false,
    xAxis: xAxis,
    yAxis: yAxis,
    categoryXField: xCategory,
    categoryYField: yCategory,
    valueField: valueField,
  }));

  series.columns.template.setAll({
    tooltipText: "{value}",
    strokeOpacity: 1,
    strokeWidth: 2,
    width: am5.percent(100),
    height: am5.percent(100),
  });

  series.events.on("datavalidated", function () {
    heatLegend.set("startValue", series.getPrivate("valueHigh"));
    heatLegend.set("endValue", series.getPrivate("valueLow"));
  });

  series.set("heatRules", [{
    target: series.columns.template,
    min: am5.color(0xfffb77),
    max: am5.color(0xfe131a),
    dataField: "value",
    key: "fill"
  }]);

  const heatLegend = chart.bottomAxesContainer.children.push(am5.HeatLegend.new(root, {
    orientation: "horizontal",
    endColor: am5.color(0xfffb77),
    startColor: am5.color(0xfe131a),
  }));

  series.columns.template.events.on("pointerover", function (event) {
    let di = event.target.dataItem;
    if (di) {
      heatLegend.showValue(<number>di.get(<any>"value", 0));
    }
  });

  wrapper.dataSetters.push(new HeatMapDataSetter(datasetKey, chart, xCategory, yCategory));
}

export class HeatMapDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly datasetKey: string,
    private readonly chart: am5xy.XYChart,
    private readonly xCategory: string,
    private readonly yCategory: string,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    const dataset = data[this.datasetKey] as CommonVizTabularDataset;

    this.chart.series.each(s => s.data.setAll(dataset));

    this.chart.xAxes.each(s => s.data.setAll(distinctCategory(dataset, this.xCategory)));
    this.chart.yAxes.each(s => s.data.setAll(distinctCategory(dataset, this.yCategory)));
  }
}

function distinctCategory(dataset: CommonVizTabularDataset, field: string): { [field: string]: any }[] {
  return [...distinctArray(dataset, item => item[field])]
    .map(item => ({[field]: item}));
}
