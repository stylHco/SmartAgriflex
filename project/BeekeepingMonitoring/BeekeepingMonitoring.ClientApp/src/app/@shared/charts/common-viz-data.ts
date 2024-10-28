import * as am5 from "@amcharts/amcharts5";

export enum CommonVizDatasetType {
  Tabular,
  Hierarchical,
}

export type CommonVizTabularDataset = CommonVizTabularRow[];
export type CommonVizTabularRow = { [key: string]: any };

export type CommonVizHierarchicalDataset = CommonVizHierarchicalNode[];
export type CommonVizHierarchicalNode = { [key: string]: any };

export type CommonVizDataset = CommonVizTabularDataset | CommonVizHierarchicalDataset;
export type CommonVizDataContainer = { [key: string]: CommonVizDataset };

export const DEFAULT_DATASET = 'DEFAULT';

export const DEFAULT_SERIES = 'DEFAULT';
export const DEFAULT_SERIES_VALUE = 'DEFAULT';

export const DEFAULT_CHILDREN = 'children';

export const DATE_FORMAT_DATE_ONLY = 'yyyy-MM-dd';

export type CommonVizDataDescriptor = {
  [key: string]: TabularDatasetSpec | HierarchicalDatasetSpec,
};

type TabularDatasetSpec = { type: CommonVizDatasetType.Tabular } & CommonVizTabularDatasetDescriptor;
type HierarchicalDatasetSpec = { type: CommonVizDatasetType.Hierarchical } & CommonVizHierarchicalDatasetDescriptor;

export type CommonVizDatasetDescriptor =
  CommonVizTabularDatasetDescriptor |
  CommonVizHierarchicalDatasetDescriptor;

export type CommonVizTabularDatasetDescriptor = {
  keyFields: string[];
  valueFields: { [seriesName: string]: CommonVizDataSeriesDescriptor };

  dateFields?: { [fieldName: string]: CommonVizDateFieldDescriptor };
}

export type CommonVizHierarchicalDatasetDescriptor = {
  keyField: string;
  childrenField: string;

  /**
   * If true, hint to charts to not show the root node.
   */
  surrogateRoot: boolean;
  valueFields: { [seriesName: string]: CommonVizDataSeriesDescriptor };
}

export type CommonVizDataSeriesDescriptor = { [fieldType: string]: string };

export type CommonVizDateFieldDescriptor = {
  format: string;
  baseInterval: am5.time.ITimeInterval;
};
