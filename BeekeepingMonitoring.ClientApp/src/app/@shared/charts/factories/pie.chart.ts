import {ICommonChartWrapper, ICommonChartDataSetter} from "../common-chart.structures";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import {
  CommonVizDataContainer,
  CommonVizTabularDatasetDescriptor,
  DEFAULT_SERIES,
  DEFAULT_SERIES_VALUE
} from "../common-viz-data";
import {configureTopLabel, getDefaultOrFirstDataset, getDefaultOrFirstSeries, TopLabelOptions} from "./shared";

export enum PieSeriesLabelsMode {
  Standard,
  // Circular,
  Disabled,
}

export type PieChartOptions = {
  datasetKey?: string;

  categoryField?: string;
  series?: PieSeriesOptions[];

  innerRadius?: am5.Percent;

  startAngle?: number;
  endAngle?: number;

  labelsMode?: PieSeriesLabelsMode;

  label?: TopLabelOptions;
  legend?: PieChartLegendOptions;
}

export type PieSeriesOptions = {
  descriptorName: string;
  displayName?: string;

  // TODO: How should interact with multiple series?
  labelsMode?: PieSeriesLabelsMode;
};

function getSeriesOptions(
  wrapper: ICommonChartWrapper,
  options: PieChartOptions,
  datasetDescriptor: CommonVizTabularDatasetDescriptor,
): PieSeriesOptions[] {
  if (options.series) return options.series;

  const series = getDefaultOrFirstSeries(datasetDescriptor);

  return [{
    descriptorName: series,
    displayName: series === DEFAULT_SERIES ? undefined : series,
  }];
}

export function configurePieChart(wrapper: ICommonChartWrapper, options: PieChartOptions): void {
  const datasetKey = options.datasetKey ?? getDefaultOrFirstDataset(wrapper.dataDescriptor);
  const datasetDescriptor = wrapper.dataDescriptor[datasetKey] as CommonVizTabularDatasetDescriptor;

  const categoryField = options.categoryField ?? datasetDescriptor.keyFields[0];
  const seriesOptions = getSeriesOptions(wrapper, options, datasetDescriptor);

  const root = wrapper.root;

  const chart = wrapper.chart = root.container.children.push(am5percent.PieChart.new(root, {
    innerRadius: options.innerRadius,
  }));

  // Chart breaks if these are undefined and set above
  if (options.startAngle !== undefined) chart.set('startAngle', options.startAngle);
  if (options.endAngle !== undefined) chart.set('endAngle', options.endAngle);

  const bgColor = root.interfaceColors.get("background");

  for (let i = 0; i < seriesOptions.length; i++) {
    const seriesOption = seriesOptions[i];
    const isOuter = i === seriesOptions.length - 1;

    const series = chart.series.push(am5percent.PieSeries.new(root, {
      startAngle: options.startAngle,
      endAngle: options.endAngle,

      valueField: datasetDescriptor.valueFields[seriesOption.descriptorName][DEFAULT_SERIES_VALUE],
      categoryField: categoryField,
    }));

    if (seriesOption.displayName) {
      series.set('name', seriesOption.displayName);
    }

    // Needed for animate in
    if (options.startAngle || options.endAngle) {
      series.states.create('hidden', {
        startAngle: options.startAngle,
        endAngle: options.endAngle,
      });
    }

    let labelsMode = seriesOption.labelsMode ?? options.labelsMode;
    let hideLabels = false;

    if (seriesOptions.length > 1) {
      series.slices.template.setAll({
        stroke: bgColor,
        strokeWidth: 2,
        tooltipText: "{name} ({category}): {valuePercentTotal.formatNumber('0.00')}% ({value})"
      });

      if (!isOuter) {
        hideLabels = true;
        series.slices.template.states.create('hover', {scale: 0.95});
      }
    }

    if (labelsMode === PieSeriesLabelsMode.Disabled) {
      hideLabels = true;
    }

    if (hideLabels) {
      series.ticks.template.setAll({forceHidden: true});
      series.labels.template.setAll({forceHidden: true});
    }
  }

  if (options.label) {
    configureTopLabel(wrapper, options.label);
  }

  wrapper.dataSetters.push(new PieChartDataSetter(datasetKey, chart));

  // The data setter should be after the pie chart itself
  if (options.legend) {
    configurePieLegend(wrapper, options.legend);
  }
}

export class PieChartDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly datasetKey: string,
    private readonly chart: am5percent.PieChart,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    this.chart.series.each(s => s.data.setAll(data[this.datasetKey]));
  }
}

export enum PieChatLegendPosition {
  Bottom,
  Right,
}

export type PieChartLegendOptions = true | {
  position: PieChatLegendPosition;
};

const defaultPieChartLegendOptions: Exclude<PieChartLegendOptions, boolean> = {
  position: PieChatLegendPosition.Bottom,
};

export function configurePieLegend(wrapper: ICommonChartWrapper, options: PieChartLegendOptions): void {
  const position: PieChatLegendPosition = typeof options === 'object'
    ? options.position
    : defaultPieChartLegendOptions.position;

  const root = wrapper.root;
  const chart = wrapper.chart as am5percent.PieChart;

  const legend = chart.children.push(am5.Legend.new(root, {}));

  switch (position) {
    case PieChatLegendPosition.Bottom:
      legend.setAll({
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 10,
        marginBottom: 15,
      });

      // TODO: this is a hack, we could be trampling on other things. Instead,
      // set up some kind of slots (chart bottom/left/etc) when creating the chart?
      chart.setAll({
        layout: root.verticalLayout,
      });

      break;

    case PieChatLegendPosition.Right:
      throw 'PieChatLegendPosition.Right is not implemented yet';
    // break;
  }

  wrapper.dataSetters.push(new PieChartLegendDataSetter(chart, legend));
}

export class PieChartLegendDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly chart: am5percent.PieChart,
    private readonly legend: am5.Legend,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    // TODO: what happens if there is more than 1 series?
    this.legend.data.setAll(this.chart.series.getIndex(0)?.dataItems ?? []);
  }
}
