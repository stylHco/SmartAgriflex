import {ICommonChartDataSetter, ICommonChartWrapper} from "../common-chart.structures";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5 from "@amcharts/amcharts5";
import {
  configureTopLabel,
  getDefaultOrFirstDataset,
  getSeriesNameSettings,
  getSingleValueSeriesDataField,
  isDateField, MaybeNamedSeriesOptions, MaybeNamedSeriesSettings,
  SingleValueSeriesDataSource, TopLabelOptions,
  tryConfigurePreProcessDates
} from "./shared";
import {CommonVizDataContainer, CommonVizTabularDatasetDescriptor} from "../common-viz-data";

// Base axis = axis which separates the data points from each other.
// Usually dates or categories as the X axis.
// Setting it to vertical is usually done for a horizontal bar chart.
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Base_axis

export type XyCommonChartOptions = {
  isBaseAxisVertical?: boolean;

  baseAxisDataset?: string;
  baseAxisField?: string;

  /**
   * Used only if the axis are a date axis.
   * Overrides the interval set in data descriptor.
   */
  baseAxisBaseInterval?: am5.time.ITimeInterval;

  label?: TopLabelOptions;
};

export function configureCommonXyChart(wrapper: ICommonChartWrapper, options: XyCommonChartOptions): XyCommonChartContext {
  const baseAxisDataset = getDefaultOrFirstDataset(wrapper.dataDescriptor);
  const baseAxisDatasetDescriptor = wrapper.dataDescriptor[baseAxisDataset] as CommonVizTabularDatasetDescriptor;

  const isBaseAxisVertical = options.isBaseAxisVertical ?? false;
  const baseAxisField = options.baseAxisField ?? baseAxisDatasetDescriptor.keyFields[0];

  const root = wrapper.root;

  const chart = wrapper.chart = root.container.children.push(am5xy.XYChart.new(root, {
    layout: root.verticalLayout,
  }));

  const axisRenderer = isBaseAxisVertical
    ? am5xy.AxisRendererY.new(root, {})
    : am5xy.AxisRendererX.new(root, {});

  let baseAxis: am5xy.Axis<am5xy.AxisRenderer>;

  // Date axis if the field is a date, else assume category
  // (no support for value axis as separator right now)
  if (isDateField(baseAxisDatasetDescriptor, baseAxisField)) {
    const baseInterval =
      options.baseAxisBaseInterval ??
      baseAxisDatasetDescriptor.dateFields[baseAxisField].baseInterval;

    baseAxis = am5xy.DateAxis.new(root, {
      baseInterval: baseInterval,
      renderer: axisRenderer,
      tooltip: am5.Tooltip.new(root, {}),
    });

    tryConfigurePreProcessDates(wrapper);
  } else {
    const axis = baseAxis = am5xy.CategoryAxis.new(root, {
      renderer: axisRenderer,
      categoryField: baseAxisField,

      tooltip: am5.Tooltip.new(root, {}),
    });

    wrapper.dataSetters.push(new CategoryAxisDataSetter(baseAxisDataset, axis));
  }

  if (isBaseAxisVertical) chart.yAxes.push(baseAxis);
  else chart.xAxes.push(baseAxis);

  if (options.label) {
    configureTopLabel(wrapper, options.label);
  }

  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
  cursor.lineY.set('visible', false);
  cursor.lineX.set('visible', false);

  return new XyCommonChartContext(wrapper, isBaseAxisVertical, baseAxisDataset, baseAxisField);
}

// Use configureCommonXyChart() to create this
export class XyCommonChartContext {
  constructor(
    public readonly wrapper: ICommonChartWrapper,
    public readonly isBaseAxisVertical: boolean,
    public readonly baseAxisDataset: string,
    public readonly baseAxisField: string,
  ) {
    if (!(wrapper.chart instanceof am5xy.XYChart)) {
      throw new Error('XyCommonChartContext required wrapper.chart to be an XYChart');
    }
  }

  get chart(): am5xy.XYChart {
    return <am5xy.XYChart>this.wrapper.chart;
  }

  get baseAxis(): am5xy.Axis<am5xy.AxisRenderer> {
    const axes = this.isBaseAxisVertical
      ? this.chart.yAxes
      : this.chart.xAxes;

    return axes.getIndex(0)!;
  }

  get baseAxisDatasetDescriptor(): CommonVizTabularDatasetDescriptor {
    return this.wrapper.dataDescriptor[this.baseAxisDataset] as CommonVizTabularDatasetDescriptor;
  }
}

export class CategoryAxisDataSetter implements ICommonChartDataSetter {
  constructor(
    public readonly datasetKey: string,
    private readonly axis: am5xy.CategoryAxis<am5xy.AxisRenderer>,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    this.axis.data.setAll(data[this.datasetKey]);
  }
}

export function isAxisOpposite(axis: am5xy.Axis<am5xy.AxisRenderer>): boolean {
  const renderer = axis.get('renderer');

  if (renderer instanceof am5xy.AxisRendererX) return renderer.get('opposite') ?? false;
  if (renderer instanceof am5xy.AxisRendererY) return renderer.get('opposite') ?? false;

  throw new Error('isAxisOpposite(): The renderer is neither X nor Y');
}

export function getOrConfigureValueAxis(
  context: XyCommonChartContext,
  isOpposite: boolean,
): am5xy.ValueAxis<am5xy.AxisRenderer> {
  const axes = context.isBaseAxisVertical
    ? context.chart.xAxes
    : context.chart.yAxes;

  for (const axis of axes) {
    if (isAxisOpposite(axis) === isOpposite) {
      return <am5xy.ValueAxis<am5xy.AxisRenderer>>axis; // TODO: type check instead of assertion
    }
  }

  const root = context.wrapper.root;
  const renderer = context.isBaseAxisVertical
    ? am5xy.AxisRendererX.new(root, {opposite: isOpposite})
    : am5xy.AxisRendererY.new(root, {opposite: isOpposite});

  return axes.push(am5xy.ValueAxis.new(root, {
    renderer: renderer,
  }));
}

export function getSeparatorField(xyContext: XyCommonChartContext): { category?: string, value?: string } {
  const isSeparatorDate = isDateField(xyContext.baseAxisDatasetDescriptor, xyContext.baseAxisField);

  return {
    category: isSeparatorDate ? undefined : xyContext.baseAxisField,
    value: isSeparatorDate ? xyContext.baseAxisField : undefined,
  };
}

export class SimpleXySeriesDataSetter implements ICommonChartDataSetter {
  constructor(
    public readonly datasetKey: string,
    public readonly series: am5xy.XYSeries,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    this.series.data.setAll(data[this.datasetKey]);
  }
}

export type XySeriesAxesSettings = {
  xAxis: am5xy.Axis<am5xy.AxisRenderer>;
  yAxis: am5xy.Axis<am5xy.AxisRenderer>;

  baseAxis: am5xy.Axis<am5xy.AxisRenderer>;
};

export function getXySeriesAxesSettings(xyContext: XyCommonChartContext, oppositeAxis: boolean): XySeriesAxesSettings {
  const valueAxis = getOrConfigureValueAxis(xyContext, oppositeAxis);
  const baseAxis = xyContext.baseAxis;

  return {
    xAxis: xyContext.isBaseAxisVertical ? valueAxis : baseAxis,
    yAxis: xyContext.isBaseAxisVertical ? baseAxis : valueAxis,

    baseAxis: baseAxis,
  };
}

// Horizontal base axis
type XySeriesBaseFieldSettingsBaseX = {
  categoryXField?: string;
  valueXField?: string;
};

// Vertical base axis
type XySeriesBaseFieldSettingsBaseY = {
  categoryYField?: string;
  valueYField?: string;
};

export type XySeriesBaseFieldSettings = XySeriesBaseFieldSettingsBaseX & XySeriesBaseFieldSettingsBaseY;

export function getXySeriesBaseFieldSettings(xyContext: XyCommonChartContext): XySeriesBaseFieldSettings {
  const separatorField = getSeparatorField(xyContext);

  if (xyContext.isBaseAxisVertical) {
    return {
      categoryYField: separatorField.category,
      valueYField: separatorField.value,
    };
  }

  return {
    categoryXField: separatorField.category,
    valueXField: separatorField.value,
  };
}

// Horizontal base axis
type XySingleValueSeriesFieldSettingsBaseX = XySeriesBaseFieldSettingsBaseX & {
  valueYField: string;
};

// Vertical base axis
type XySingleValueSeriesFieldSettingsBaseY = XySeriesBaseFieldSettingsBaseY & {
  valueXField: string;
};

export type XySingleValueSeriesFieldSettings =
  XySingleValueSeriesFieldSettingsBaseX |
  XySingleValueSeriesFieldSettingsBaseY;

export function getSingleValueXySeriesFieldSettings(
  xyContext: XyCommonChartContext,
  source: SingleValueSeriesDataSource,
): XySingleValueSeriesFieldSettings {
  const valueField = getSingleValueSeriesDataField(xyContext.wrapper.dataDescriptor, source);
  const valueSettings = xyContext.isBaseAxisVertical
    ? {valueXField: valueField}
    : {valueYField: valueField};

  return {
    ...getXySeriesBaseFieldSettings(xyContext),
    ...valueSettings,
  };
}

export type MaybeOppositeAxisSeriesOptions = { oppositeAxis?: boolean };

export type XyCommonSeriesOptions =
  SingleValueSeriesDataSource &
  MaybeNamedSeriesOptions &
  MaybeOppositeAxisSeriesOptions

export type XyCommonSeriesSettings =
  XySeriesAxesSettings &
  XySingleValueSeriesFieldSettings &
  MaybeNamedSeriesSettings;

export function getXyCommonSeriesSettings(
  xyContext: XyCommonChartContext,
  options: XyCommonSeriesOptions,
): XyCommonSeriesSettings {
  return {
    ...getXySeriesAxesSettings(xyContext, options.oppositeAxis ?? false),
    ...getSingleValueXySeriesFieldSettings(xyContext, options),
    ...getSeriesNameSettings(options),
  };
}

/**
 * Call this after configuring all series.
 */
export function configureCommonXyLegend(xyContext: XyCommonChartContext): am5.Legend {
  const root = xyContext.wrapper.root;
  const chart = xyContext.chart;

  const legend = chart.children.push(am5.Legend.new(root, {
    centerX: am5.p50,
    x: am5.p50,
  }));

  legend.valueLabels.template.set('forceHidden', true);
  legend.data.setAll(chart.series.values);

  return legend;
}
