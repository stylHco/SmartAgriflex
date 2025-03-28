import {
  CommonVizDataContainer,
  CommonVizDataDescriptor,
  CommonVizDatasetType, CommonVizTabularDataset,
  DEFAULT_DATASET, DEFAULT_SERIES
} from "../../../../../../@shared/charts/common-viz-data";
import {CommonChartConfigureFn, ICommonChartDataSetter} from "../../../../../../@shared/charts/common-chart.structures";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5 from "@amcharts/amcharts5";
import {SimpleXySeriesDataSetter} from "../../../../../../@shared/charts/factories/xy.common";
import {distinctArray} from "../../../../../../@shared/utils/collection.helpers";

export const dataDescriptor: CommonVizDataDescriptor = {
  [DEFAULT_DATASET]: {
    type: CommonVizDatasetType.Tabular,
    keyFields: [],
    valueFields: {
      [DEFAULT_SERIES]: {
        // Hardcoded directly
        // [ACTUAL_VALUE]: 'actual',
        // [TARGET_VALUE]: 'target',
      },
    },
  },
};

export const configureFn: CommonChartConfigureFn = wrapper => {
  const root = wrapper.root;

  const chart = wrapper.chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: true,
    panY: true,
    wheelY: "zoomXY",
    pinchZoomX: true,
    pinchZoomY: true,
  }));

  const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
    renderer: am5xy.AxisRendererX.new(root, {}),
    tooltip: am5.Tooltip.new(root, {}),
    categoryField: 'rightHand',
  }));

  xAxis.children.push(am5.Label.new(root, {
    text: "Right hand of rule",
    x: am5.p50,
    centerX: am5.p50,
  }));

  xAxis.get('renderer').labels.template.setAll({
    forceHidden: true,
  });

  const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
    tooltip: am5.Tooltip.new(root, {}),
    categoryField: 'leftHand',
  }));

  yAxis.children.unshift(am5.Label.new(root, {
    rotation: -90,
    text: "Left hand of rule",
    y: am5.p50,
    centerX: am5.p50,
  }));

  yAxis.get('renderer').labels.template.setAll({
    forceHidden: true,
  });

  const series = chart.series.push(am5xy.LineSeries.new(root, {
    calculateAggregates: true,
    xAxis: xAxis,
    yAxis: yAxis,
    categoryXField: 'rightHand',
    categoryYField: 'leftHand',
    valueField: 'lift',
    tooltip: am5.Tooltip.new(root, {
      labelText: 'Confidence: {confidence}%\nSupport: {support}%\nRelations: {relations}\nLift: {lift}%\nRule: {rule}',
    }),
  }));

  const circleTemplate = am5.Template.new<am5.Circle>({});
  series.bullets.push(() => {
    const graphics = am5.Circle.new(root, {
      fill: series.get('fill'),
    }, circleTemplate);

    return am5.Bullet.new(root, {
      sprite: graphics,
    });
  });

  series.set('heatRules', [{
    target: circleTemplate,
    // minValue: 0.5,
    // maxValue: 2,
    dataField: 'value',
    key: 'fill',
    min: am5.color(0xff0000),
    max: am5.color(0x00ff00),
  }]);


  series.strokes.template.set('strokeOpacity', 0);

  chart.set('cursor', am5xy.XYCursor.new(root, {
    xAxis: xAxis,
    yAxis: yAxis,
    snapToSeries: [series],
  }));

  chart.set('scrollbarX', am5.Scrollbar.new(root, {
    orientation: "horizontal",
  }));

  chart.set('scrollbarY', am5.Scrollbar.new(root, {
    orientation: "vertical",
  }));

  wrapper.dataSetters.push(new RuleAxisDataSetter(xAxis));
  wrapper.dataSetters.push(new RuleAxisDataSetter(yAxis));
  wrapper.dataSetters.push(new SimpleXySeriesDataSetter(DEFAULT_DATASET, series));
};

class RuleAxisDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly axis: am5xy.CategoryAxis<any>,
  ) {
  }

  setData(data: CommonVizDataContainer): void {
    const dataset = data[DEFAULT_DATASET] as CommonVizTabularDataset;
    const field = this.axis.get('categoryField');

    const values = [...distinctArray(dataset, row => row[field])];
    values.sort();

    this.axis.data.setAll(values.map(value => ({[field]: value})));
  }
}

