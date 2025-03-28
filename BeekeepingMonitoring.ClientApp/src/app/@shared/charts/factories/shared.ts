import {
  CommonChartConfigureFn,
  ICommonChartTabularDataPreProcessor,
  ICommonChartWrapper
} from "../common-chart.structures";
import {
  CommonVizTabularDatasetDescriptor,
  CommonVizDateFieldDescriptor,
  DEFAULT_SERIES,
  DEFAULT_SERIES_VALUE, CommonVizTabularDataset, CommonVizDataDescriptor, DEFAULT_DATASET, CommonVizDatasetDescriptor
} from "../common-viz-data";
import * as am5 from "@amcharts/amcharts5";

export function createConfigureChartFn<TOptions>(
  impl: (wrapper: ICommonChartWrapper, options: TOptions) => void,
  options: TOptions,
): CommonChartConfigureFn {
  return wrapper => impl(wrapper, options);
}

export function getDefaultOrFirstDataset(descriptor: CommonVizDataDescriptor): string {
  const datasets = Object.keys(descriptor);

  if (datasets.includes(DEFAULT_DATASET)) {
    return DEFAULT_DATASET;
  }

  return datasets[0];
}

export function getDefaultOrFirstSeries(descriptor: CommonVizDatasetDescriptor): string {
  const series = Object.keys(descriptor.valueFields);

  if (series.includes(DEFAULT_SERIES)) {
    return DEFAULT_SERIES;
  }

  return series[0];
}

// Adds DatePreProcessor for all fields which don't have one already
export function tryConfigurePreProcessDates(wrapper: ICommonChartWrapper): void {
  for (const datasetKey in wrapper.dataDescriptor) {
    tryConfigurePreProcessDatesForDataset(wrapper, datasetKey);
  }
}

function tryConfigurePreProcessDatesForDataset(wrapper: ICommonChartWrapper, datasetKey: string): void {
  const datasetDescriptor = wrapper.dataDescriptor[datasetKey];

  if (!('dateFields' in datasetDescriptor)) return;
  if (!datasetDescriptor.dateFields) return;

  const preProcessors = wrapper.getPreProcessorsForDataset(datasetKey);

  // Collect the fields for which DatePreProcessor is already set
  const configuredFields: string[] = [];
  for (const preProcessor of preProcessors) {
    if (preProcessor instanceof DatePreProcessor) {
      configuredFields.push(preProcessor.field);
    }
  }

  // Add the rest
  for (let field in datasetDescriptor.dateFields) {
    if (configuredFields.includes(field)) continue;

    preProcessors.push(new DatePreProcessor(
      wrapper.root, field, datasetDescriptor.dateFields[field].format
    ));
  }
}

export class DatePreProcessor implements ICommonChartTabularDataPreProcessor {
  private _processor: am5.DataProcessor;

  constructor(
    root: am5.Root,
    public readonly field: string,
    format: string,
  ) {
    this._processor = am5.DataProcessor.new(root, {
      dateFields: [field],
      dateFormat: format,
    });
  }

  preProcessTabular(dataset: CommonVizTabularDataset) {
    this._processor.processMany(dataset);
  }
}

export function isDateField(
  dataDescriptor: CommonVizTabularDatasetDescriptor,
  field: string,
): dataDescriptor is typeof dataDescriptor & { dateFields: { field: CommonVizDateFieldDescriptor } } {
  return dataDescriptor.dateFields?.hasOwnProperty(field) ?? false;
}

export type SingleDatasetSource = { datasetKey: string };

export type SingleValueSeriesFieldSource = { valueField: string };
export type SingleValueSeriesDescriptorSource = {
  descriptorName: string;
  valueFieldKey?: string;
};

export type SingleValueSeriesDataSource =
  SingleDatasetSource &
  (SingleValueSeriesFieldSource | SingleValueSeriesDescriptorSource);

export function getSingleValueSeriesDataField(
  dataDescriptor: CommonVizDataDescriptor,
  source: SingleValueSeriesDataSource,
): string {
  if ('valueField' in source) {
    return source.valueField;
  }

  const datasetDescriptor = dataDescriptor[source.datasetKey] as CommonVizTabularDatasetDescriptor;
  const valueFieldKey = source.valueFieldKey ?? DEFAULT_SERIES_VALUE;

  return datasetDescriptor.valueFields[source.descriptorName][valueFieldKey];
}

// This is slightly overkill currently, but maybe we will
// have more advanced behaviour in future.

export type MaybeNamedSeriesOptions = { displayName?: string };
export type MaybeNamedSeriesSettings = { name?: string; };

export function getSeriesNameSettings(options: MaybeNamedSeriesOptions): MaybeNamedSeriesSettings {
  return {
    name: options.displayName,
  };
}

export type TopLabelOptions = string | {
  text: string;
};

export function configureTopLabel(wrapper: ICommonChartWrapper, options: TopLabelOptions): void {
  const text = typeof options === 'string' ? options : options.text;
  const topLevelContainer = wrapper.rootContainer ?? wrapper.chart;

  topLevelContainer!.children.unshift(am5.Label.new(wrapper.root, {
    text: text,
    fontSize: 25,
    fontWeight: '500',
    textAlign: 'center',
    x: am5.percent(50),
    centerX: am5.percent(50),
    paddingTop: 0,
    paddingBottom: 0,
  }));
}
