import {ICommonChartDataSetter, ICommonChartWrapper} from "../common-chart.structures";
import {
  CommonVizDataContainer,
  CommonVizDataDescriptor,
  CommonVizHierarchicalDatasetDescriptor,
  DEFAULT_SERIES_VALUE
} from "../common-viz-data";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import {getDefaultOrFirstDataset, getDefaultOrFirstSeries} from "./shared";

export class SimpleHierarchyDataSetter implements ICommonChartDataSetter {
  constructor(
    public readonly datasetKey: string,
    public readonly hierarchy: am5hierarchy.Hierarchy,
  ) {
  }

  setData(data: CommonVizDataContainer) {
    this.hierarchy.data.setAll(data[this.datasetKey]);
    this.hierarchy.set('selectedDataItem', this.hierarchy.dataItems[0]);
  }
}

// https://www.amcharts.com/docs/v5/charts/hierarchy/#Additional_controls
export function getOrCreateRootContainer(wrapper: ICommonChartWrapper): am5.Container {
  if (!wrapper.rootContainer) {
    const root = wrapper.root;

    wrapper.rootContainer = root.container.children.push(am5.Container.new(root, {
      width: am5.percent(100),
      height: am5.percent(100),
      layout: root.verticalLayout,
    }));
  }

  return wrapper.rootContainer;
}

export type SingleValueHierarchySourceOptions = {
  datasetKey?: string;
  seriesKey?: string;
  valueKey?: string;
}

export type SingleValueHierarchyFieldsSettings = {
  childDataField: string;
  categoryField: string;
  valueField: string;

  topDepth: number;
};

export function getSingleValueHierarchyFieldsSettings(
  dataDescriptor: CommonVizDataDescriptor,
  source: SingleValueHierarchySourceOptions
): SingleValueHierarchyFieldsSettings {
  const datasetKey = source.datasetKey ?? getDefaultOrFirstDataset(dataDescriptor);
  const datasetDescriptor = dataDescriptor[datasetKey] as CommonVizHierarchicalDatasetDescriptor;

  const seriesKey = source.seriesKey ?? getDefaultOrFirstSeries(datasetDescriptor);
  const valueKey = source.valueKey ?? DEFAULT_SERIES_VALUE;

  return {
    valueField: datasetDescriptor.valueFields[seriesKey][valueKey],
    categoryField: datasetDescriptor.keyField,
    childDataField: datasetDescriptor.childrenField,

    topDepth: datasetDescriptor.surrogateRoot ? 1 : 0,
  };
}
