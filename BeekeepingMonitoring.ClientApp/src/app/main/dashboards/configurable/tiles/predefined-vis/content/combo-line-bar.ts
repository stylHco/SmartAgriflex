import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES_VALUE
} from "../../../../../../@shared/charts/common-viz-data";
import {configureBarSeries} from "../../../../../../@shared/charts/factories/bar.chart";
import {CommonChartConfigureFn} from "../../../../../../@shared/charts/common-chart.structures";
import {configureCommonXyChart, configureCommonXyLegend} from "../../../../../../@shared/charts/factories/xy.common";
import {configureLineSeries} from "../../../../../../@shared/charts/factories/line.chart";

export const dataDescriptor: CommonVizDataDescriptor = {
  [DEFAULT_DATASET]: {
    type: CommonVizDatasetType.Tabular,
    keyFields: ['year'],
    valueFields: {
      volume: {[DEFAULT_SERIES_VALUE]: 'volume'},
      value: {[DEFAULT_SERIES_VALUE]: 'value'},
    },
  },
};

export const configureFn: CommonChartConfigureFn = wrapper => {
  const xyContext = configureCommonXyChart(wrapper, {});

  configureBarSeries(xyContext, {
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: 'volume',
    displayName: 'Volume',
  });

  configureLineSeries(xyContext, {
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: 'value',
    displayName: 'Value',

    oppositeAxis: true,
  });

  configureCommonXyLegend(xyContext);
};
