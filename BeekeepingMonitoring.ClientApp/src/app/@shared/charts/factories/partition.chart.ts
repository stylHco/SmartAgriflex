import {
  getOrCreateRootContainer,
  getSingleValueHierarchyFieldsSettings, SimpleHierarchyDataSetter,
  SingleValueHierarchySourceOptions
} from "./hierarchical.common";
import {ICommonChartWrapper} from "../common-chart.structures";
import {getDefaultOrFirstDataset} from "./shared";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";

export type PartitionChartOptions = SingleValueHierarchySourceOptions & {};

export function configurePartitionChart(wrapper: ICommonChartWrapper, options: PartitionChartOptions): void {
  const datasetKey = options.datasetKey ?? getDefaultOrFirstDataset(wrapper.dataDescriptor);

  const container = getOrCreateRootContainer(wrapper);

  const series = container.children.push(am5hierarchy.Partition.new(wrapper.root, {
    ...getSingleValueHierarchyFieldsSettings(wrapper.dataDescriptor, options),
    orientation: 'horizontal',
  }));

  wrapper.dataSetters.push(new SimpleHierarchyDataSetter(datasetKey, series));
}
