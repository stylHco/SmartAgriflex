import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES
} from "../../../../../../@shared/charts/common-viz-data";
import {CommonChartConfigureFn} from "../../../../../../@shared/charts/common-chart.structures";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5 from "@amcharts/amcharts5";
import {SimpleXySeriesDataSetter} from "../../../../../../@shared/charts/factories/xy.common";

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

  const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererX.new(root, {minGridDistance: 50}),
    tooltip: am5.Tooltip.new(root, {}),
  }));

  xAxis.children.push(am5.Label.new(root, {
    text: "Confidence (%)",
    x: am5.p50,
    centerX: am5.p50,
  }));

  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
    tooltip: am5.Tooltip.new(root, {}),
  }));

  yAxis.children.unshift(am5.Label.new(root, {
    rotation: -90,
    text: "Support (%)",
    y: am5.p50,
    centerX: am5.p50,
  }));

  const series = chart.series.push(am5xy.LineSeries.new(root, {
    calculateAggregates: true,
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: 'support',
    valueXField: 'confidence',
    tooltip: am5.Tooltip.new(root, {
      labelText: 'Confidence: {valueX}%\nSupport: {valueY}%\nRelations: {relations}\nLift: {lift}%\nRule: {rule}',
    }),
  }));

  const circleTemplate = am5.Template.new<am5.Circle>({});
  series.bullets.push((root, series, dataItem) => {
    const graphics = am5.Circle.new(root, {
      fill: getSupportConfidenceColour((dataItem.dataContext as any)['relations']),
    }, circleTemplate);

    return am5.Bullet.new(root, {
      sprite: graphics,
    });
  });

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

  wrapper.dataSetters.push(new SimpleXySeriesDataSetter(DEFAULT_DATASET, series));
};

function getSupportConfidenceColour(relations: number): am5.Color {
  switch (relations) {
    case 2:
      return am5.color(0xFF7A1C);

    case 3:
      return am5.color(0x894DFF);

    case 4:
      return am5.color(0x16FF81);

    default:
      return am5.color(0xfff400);
  }
}
