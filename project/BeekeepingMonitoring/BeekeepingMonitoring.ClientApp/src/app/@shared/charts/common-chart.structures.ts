import {
  CommonVizDataContainer,
  CommonVizDataDescriptor, CommonVizDatasetType, CommonVizHierarchicalDataset,
  CommonVizTabularDataset
} from "./common-viz-data";
import {Chart, Container, Root} from "@amcharts/amcharts5";
import {AmChartThemer} from "./am-chart-themer";
import {mapGetOrCreate} from "../utils/collection.helpers";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

export interface ICommonChartWrapper {
  readonly dataDescriptor: CommonVizDataDescriptor;

  readonly root: Root;
  readonly themer: AmChartThemer;

  exporting?: am5plugins_exporting.Exporting;


  chart?: Chart;
  rootContainer?: Container; // For hierarchical charts

  /**
   * If set, the data will first be deep cloned, run through the preProcessors and only
   * then be passed onto the setters
   */
  getPreProcessorsForDataset(datasetKey: string): CommonChartDataPreProcessor[];

  readonly dataSetters: ICommonChartDataSetter[];
}

export type CommonChartDataPreProcessor =
  ICommonChartTabularDataPreProcessor |
  ICommonChartHierarchicalDataPreProcessor;

export interface ICommonChartTabularDataPreProcessor {
  preProcessTabular(dataset: CommonVizTabularDataset): void;
}

export interface ICommonChartHierarchicalDataPreProcessor {
  preProcessHierarchical(dataset: CommonVizHierarchicalDataset): void;
}

export interface ICommonChartDataSetter {
  setData(data: CommonVizDataContainer): void;
}

export type CommonChartConfigureFn = (wrapper: ICommonChartWrapper) => void;

export class CommonChartWrapper implements ICommonChartWrapper {
  private readonly _preProcessorsForDataset = new Map<string, CommonChartDataPreProcessor[]>();

  public readonly dataSetters: ICommonChartDataSetter[] = [];

  constructor(
    public readonly dataDescriptor: CommonVizDataDescriptor,
    public readonly root: Root,
    public readonly themer: AmChartThemer,
  ) {
  }

  public exporting = am5plugins_exporting.Exporting.new(this.root, {
    menu: am5plugins_exporting.ExportingMenu.new(this.root, {}),
  });

  getPreProcessorsForDataset(dataset: string): CommonChartDataPreProcessor[] {
    return mapGetOrCreate(this._preProcessorsForDataset, dataset, () => []);
  }
}

export function applyCommonChartData(wrapper: ICommonChartWrapper, data: CommonVizDataContainer) {
  const newData: CommonVizDataContainer = {};

  for (const datasetKey in data) {
    const preProcessors = wrapper.getPreProcessorsForDataset(datasetKey);

    if (preProcessors.length < 1) newData[datasetKey] = data[datasetKey];
    else {
      const dataset = JSON.parse(JSON.stringify(data[datasetKey])); // Dumb deep clone

      for (const preProcessor of preProcessors) {
        switch (wrapper.dataDescriptor[datasetKey].type) {
          case CommonVizDatasetType.Tabular:
            (preProcessor as ICommonChartTabularDataPreProcessor).preProcessTabular(dataset);
            break;

          case CommonVizDatasetType.Hierarchical:
            (preProcessor as ICommonChartHierarchicalDataPreProcessor).preProcessHierarchical(dataset);
            break;
        }
      }

      newData[datasetKey] = dataset;
    }
  }

  for (const setter of wrapper.dataSetters) {
    setter.setData(newData);
  }
}
