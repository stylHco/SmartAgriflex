import {
  CommonVizDataDescriptor,
  CommonVizDatasetType, DATE_FORMAT_DATE_ONLY,
  DEFAULT_DATASET, DEFAULT_SERIES_VALUE
} from "../../../../../../@shared/charts/common-viz-data";
import {createConfigureChartFn} from "../../../../../../@shared/charts/factories/shared";
import {configureTimeLineChart} from "../../../../../../@shared/charts/factories/time-line.chart";

export const dataDescriptor: CommonVizDataDescriptor = {
  [DEFAULT_DATASET]: {
    type: CommonVizDatasetType.Tabular,
    keyFields: ['date'],
    valueFields: {
      volume: {[DEFAULT_SERIES_VALUE]: 'volume'},
      value: {[DEFAULT_SERIES_VALUE]: 'value'},
    },
    dateFields: {
      'date': {
        format: DATE_FORMAT_DATE_ONLY,
        baseInterval: {
          timeUnit: 'month',
          count: 1,
        },
      },
    },
  },
};

export const configureFn = createConfigureChartFn(configureTimeLineChart, {});
