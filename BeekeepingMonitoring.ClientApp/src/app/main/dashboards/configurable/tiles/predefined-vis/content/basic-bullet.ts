import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES
} from "../../../../../../@shared/charts/common-viz-data";
import {createConfigureChartFn} from "../../../../../../@shared/charts/factories/shared";
import {
  ACTUAL_VALUE,
  configureBulletChart,
  TARGET_VALUE
} from "../../../../../../@shared/charts/factories/bullet.chart";

export const dataDescriptor: CommonVizDataDescriptor = {
  [DEFAULT_DATASET]: {
    type: CommonVizDatasetType.Tabular,
    keyFields: ['series'],
    valueFields: {
      [DEFAULT_SERIES]: {
        [ACTUAL_VALUE]: 'actual',
        [TARGET_VALUE]: 'target',
      },
    },
  },
};

export const configureFn = createConfigureChartFn(configureBulletChart, {});
