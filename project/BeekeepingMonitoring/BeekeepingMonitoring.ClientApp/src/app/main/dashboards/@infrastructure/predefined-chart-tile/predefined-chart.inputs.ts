import {CommonChartConfigureFn} from "../../../../@shared/charts/common-chart.structures";
import {CommonVizDataDescriptor} from "../../../../@shared/charts/common-viz-data";

export const DESCRIPTOR_INPUT = 'descriptor';
export const CONFIGURE_FN_INPUT = 'configureFn';

export type PredefinedChartComponentInputs = {
  [DESCRIPTOR_INPUT]: CommonVizDataDescriptor,
  [CONFIGURE_FN_INPUT]: CommonChartConfigureFn,
};
