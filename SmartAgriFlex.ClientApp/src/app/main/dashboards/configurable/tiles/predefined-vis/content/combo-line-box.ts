import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES, DEFAULT_SERIES_VALUE
} from "../../../../../../@shared/charts/common-viz-data";
import {
  configureBoxSeries, COUNT_VALUE, MAX_VALUE,
  MEDIAN_VALUE,
  MIN_VALUE,
  Q1_VALUE,
  Q3_VALUE
} from "../../../../../../@shared/charts/factories/box.plot";
import {CommonChartConfigureFn} from "../../../../../../@shared/charts/common-chart.structures";
import {configureCommonXyChart} from "../../../../../../@shared/charts/factories/xy.common";
import {configureLineSeries} from "../../../../../../@shared/charts/factories/line.chart";

export const dataDescriptor: CommonVizDataDescriptor = {
  [DEFAULT_DATASET]: {
    type: CommonVizDatasetType.Tabular,
    keyFields: ['year'],
    valueFields: {
      [DEFAULT_SERIES]: {
        [MIN_VALUE]: 'min',
        [Q1_VALUE]: 'q1',
        [MEDIAN_VALUE]: 'median',
        [Q3_VALUE]: 'q3',
        [MAX_VALUE]: 'max',
        [COUNT_VALUE]: 'count',
      },
      volume: {
        [DEFAULT_SERIES_VALUE]: 'totalVolume',
      },
    },
  },
  outliers: {
    type: CommonVizDatasetType.Tabular,
    keyFields: ['year'],
    valueFields: {
      [DEFAULT_SERIES]: {
        [DEFAULT_SERIES_VALUE]: 'value',
      },
    },
  },
};

export const configureFn: CommonChartConfigureFn = wrapper => {
  const xyContext = configureCommonXyChart(wrapper, {});

  configureBoxSeries(xyContext, {
    descriptorName: DEFAULT_SERIES,
  });

  configureLineSeries(xyContext, {
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: 'volume',
    displayName: 'Volume',

    oppositeAxis: true,
  });
};
