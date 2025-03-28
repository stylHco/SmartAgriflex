import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES, DEFAULT_SERIES_VALUE
} from "../../../../../../@shared/charts/common-viz-data";
import {createConfigureChartFn} from "../../../../../../@shared/charts/factories/shared";
import {configurePieChart} from "../../../../../../@shared/charts/factories/pie.chart";
import * as am5 from "@amcharts/amcharts5";

export const dataDescriptor: CommonVizDataDescriptor = {
  [DEFAULT_DATASET]: {
    type: CommonVizDatasetType.Tabular,
    keyFields: ['outlet'],
    valueFields: {
      [DEFAULT_SERIES]: {
        [DEFAULT_SERIES_VALUE]: 'volume',
      },
    },
  },
};

export const configureFn = createConfigureChartFn(configurePieChart, {
  innerRadius: am5.percent(50),
});
