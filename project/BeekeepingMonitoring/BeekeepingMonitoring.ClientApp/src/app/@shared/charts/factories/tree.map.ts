import {
  getOrCreateRootContainer,
  getSingleValueHierarchyFieldsSettings, SimpleHierarchyDataSetter,
  SingleValueHierarchySourceOptions
} from "./hierarchical.common";
import {ICommonChartWrapper} from "../common-chart.structures";
import {getDefaultOrFirstDataset} from "./shared";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";

export type TreeMapOptions = SingleValueHierarchySourceOptions & {};

export function configureTreeMap(wrapper: ICommonChartWrapper, options: TreeMapOptions): void {
  const datasetKey = options.datasetKey ?? getDefaultOrFirstDataset(wrapper.dataDescriptor);

  const container = getOrCreateRootContainer(wrapper);

  const series = container.children.push(am5hierarchy.Treemap.new(wrapper.root, {
    ...getSingleValueHierarchyFieldsSettings(wrapper.dataDescriptor, options),
  }));

  wrapper.dataSetters.push(new SimpleHierarchyDataSetter(datasetKey, series));
}
