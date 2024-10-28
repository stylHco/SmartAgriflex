import {ICommonChartWrapper} from "../common-chart.structures";
import {
  getOrCreateRootContainer, getSingleValueHierarchyFieldsSettings,
  SimpleHierarchyDataSetter, SingleValueHierarchySourceOptions
} from "./hierarchical.common";
import {getDefaultOrFirstDataset} from "./shared";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";

export type SunburstChartOptions = SingleValueHierarchySourceOptions & {};

export function configureSunburstChart(wrapper: ICommonChartWrapper, options: SunburstChartOptions): void {
  const datasetKey = options.datasetKey ?? getDefaultOrFirstDataset(wrapper.dataDescriptor);

  const container = getOrCreateRootContainer(wrapper);

  const series = container.children.push(am5hierarchy.Sunburst.new(wrapper.root, {
    ...getSingleValueHierarchyFieldsSettings(wrapper.dataDescriptor, options),

    singleBranchOnly: true,
    innerRadius: am5.percent(30),
  }));

  wrapper.dataSetters.push(new SimpleHierarchyDataSetter(datasetKey, series));
}
