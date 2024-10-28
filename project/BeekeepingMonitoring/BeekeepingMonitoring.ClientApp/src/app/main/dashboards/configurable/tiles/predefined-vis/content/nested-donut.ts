import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES_VALUE
} from "../../../../../../@shared/charts/common-viz-data";
import {createConfigureChartFn} from "../../../../../../@shared/charts/factories/shared";
import {configurePieChart} from "../../../../../../@shared/charts/factories/pie.chart";
import * as am5 from "@amcharts/amcharts5";

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

export const configureFn = createConfigureChartFn(configurePieChart, {
  series: [
    {descriptorName: 'volume', displayName: 'Volume'},
    {descriptorName: 'value', displayName: 'Value'},
  ],

  innerRadius: am5.percent(50),

  startAngle: 180,
  endAngle: 360,
});
