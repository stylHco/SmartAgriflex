import { ICommonChartWrapper } from "../common-chart.structures";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {getDefaultOrFirstSeries, TopLabelOptions} from "./shared";
import { DEFAULT_SERIES_VALUE } from "../common-viz-data";
import {
  configureCommonXyChart,
  configureCommonXyLegend,
  getXyCommonSeriesSettings,
  SimpleXySeriesDataSetter,
  XyCommonChartContext, XyCommonSeriesOptions,
} from "./xy.common";

export type TimeLineChartSeriesOptions = {
  datasetKey?: string;
  descriptorName: string;
  displayName?: string;
  enableArea?: boolean;
  color?: am5.Color;
};

export type TimeLineChartOptions = {
  datasetKey?: string;
  dateAxisField?: string;
  enableArea?: boolean;
  enableLegend?: boolean;
  color?: am5.Color;
  baseInterval?: am5.time.ITimeInterval;
  series?: TimeLineChartSeriesOptions[];
  label?: TopLabelOptions;

};

export function configureTimeLineChart(
  wrapper: ICommonChartWrapper,
  options: TimeLineChartOptions
): void {
  const xyContext = configureCommonXyChart(wrapper, {
    baseAxisDataset: options.datasetKey,
    baseAxisField: options.dateAxisField,
    baseAxisBaseInterval: options.baseInterval,
    label: options.label,
  });

  const seriesOptions = getSeriesOptions(xyContext, options);
  const enableLegend = options.enableLegend ?? seriesOptions.length > 1;

  for (const seriesOption of seriesOptions) {
    configureLineSeries(xyContext, {
      datasetKey: seriesOption.datasetKey ?? xyContext.baseAxisDataset,
      descriptorName: seriesOption.descriptorName,
      displayName: seriesOption.displayName,
      enableArea: seriesOption.enableArea ?? options.enableArea,
      color: seriesOption.color,
    });
  }

  if (enableLegend) {
    configureCommonXyLegend(xyContext);
  }

  // Add scroll and zoom features
  const root = wrapper.root;
  const chart = xyContext.chart;

  chart.setAll({
    panX: true,
    panY: true,
    wheelX: "panX",
    wheelY: "zoomX",
    pinchZoomX: true,
  });

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "none",
    })
  );
  cursor.lineY.set("visible", false);

  xyContext.baseAxis.setAll({
    maxDeviation: 0.2,
    tooltip: am5.Tooltip.new(root, {}),
  });

  // Configure scrollbar
  const scrollbar = chart.set(
    "scrollbarX",
    am5xy.XYChartScrollbar.new(root, {
      orientation: "horizontal",
      height: 60,
    })
  );

  const sbDateAxis = scrollbar.chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      renderer: am5xy.AxisRendererX.new(root, {}),
      baseInterval: (xyContext.baseAxis as am5xy.DateAxis<am5xy.AxisRenderer>).get(
        "baseInterval"
      ),
    })
  );

  const sbValueAxis = scrollbar.chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  // Add each series to the scrollbar as well
  for (const seriesOption of seriesOptions) {
    const sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: seriesOption.descriptorName, // Field for the Y axis
        valueXField: options.dateAxisField ?? "date", // Field for the X axis (assumed "date")
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,
      })
    );

    wrapper.dataSetters.push(new SimpleXySeriesDataSetter(xyContext.baseAxisDataset, sbSeries));
  }
}

export type IndividualLineSeriesOptions = XyCommonSeriesOptions & {
  enableArea?: boolean;
  color?: am5.Color;
};

function configureLineSeries(
  xyContext: XyCommonChartContext,
  options: IndividualLineSeriesOptions
): am5xy.LineSeries {
  const root = xyContext.wrapper.root;

  const series = xyContext.chart.series.push(
    am5xy.LineSeries.new(root, {
      ...getXyCommonSeriesSettings(xyContext, options),
      fill: options.color ?? am5.color(0x6794dc),
      stroke: options.color ?? am5.color(0x6794dc),
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}",
      }),
    })
  );

  if (options.enableArea) {
    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3,
    });
  }

  xyContext.wrapper.dataSetters.push(new SimpleXySeriesDataSetter(options.datasetKey, series));

  return series;
}

function getSeriesOptions(
  xyContext: XyCommonChartContext,
  options: TimeLineChartOptions
): TimeLineChartSeriesOptions[] {
  if (options.series) return options.series;

  const series = getDefaultOrFirstSeries(xyContext.baseAxisDatasetDescriptor);

  return [
    {
      datasetKey: xyContext.baseAxisDataset,
      descriptorName: series,
      displayName: series === DEFAULT_SERIES_VALUE ? undefined : series,
    },
  ];
}
