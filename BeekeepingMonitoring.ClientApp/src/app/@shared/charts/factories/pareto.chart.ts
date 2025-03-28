import {ICommonChartTabularDataPreProcessor, ICommonChartWrapper} from "../common-chart.structures";
import {getDefaultOrFirstSeries} from "./shared";
import {CommonVizTabularDataset, CommonVizTabularRow, DEFAULT_SERIES_VALUE} from "../common-viz-data";
import {configureCommonXyChart, getOrConfigureValueAxis} from "./xy.common";
import {configureBarSeries} from "./bar.chart";
import {configureLineSeries} from "./line.chart";

export type ParetoChartOptions = {
  datasetKey?: string;

  categoryField?: string;
  seriesName?: string;
};

export function configureParetoChart(wrapper: ICommonChartWrapper, options: ParetoChartOptions): void {
  const xyContext = configureCommonXyChart(wrapper, {
    baseAxisDataset: options.datasetKey,
    baseAxisField: options.categoryField,
  });

  const seriesName = options.seriesName ?? getDefaultOrFirstSeries(xyContext.baseAxisDatasetDescriptor);
  const valueField = xyContext.baseAxisDatasetDescriptor.valueFields[seriesName][DEFAULT_SERIES_VALUE];

  // TODO: Why do we need this?
  const separatorAxisRenderer = xyContext.baseAxis.get('renderer');
  separatorAxisRenderer.set('minGridDistance', 30);
  separatorAxisRenderer.labels.template.setAll({
    paddingTop: 20,
  });

  const barSeries = configureBarSeries(xyContext, {
    datasetKey: xyContext.baseAxisDataset,
    descriptorName: seriesName,
    valueFieldKey: DEFAULT_SERIES_VALUE,
  });

  barSeries.columns.template.setAll({
    tooltipText: "{categoryX}: {valueY}",
    tooltipY: 0,
    strokeOpacity: 0,
    cornerRadiusTL: 6,
    cornerRadiusTR: 6,
  });

  const paretoSeries = configureLineSeries(xyContext, {
    datasetKey: xyContext.baseAxisDataset,
    valueField: getParetoField(valueField),
    oppositeAxis: true,
  });

  paretoSeries.setAll({
    stroke: wrapper.root.interfaceColors.get('alternativeBackground'),
    maskBullets: false,
  });

  const paretoAxis = getOrConfigureValueAxis(xyContext, true);

  paretoAxis.setAll({
    min: 0,
    max: 100,
    strictMinMax: true,
  });

  paretoAxis.get('renderer').grid.template.set('forceHidden', true);
  paretoAxis.set('numberFormat', "#'%");

  wrapper.getPreProcessorsForDataset(xyContext.baseAxisDataset).push(new ParetoSeriesDataPreprocessor(valueField));
}

const PARETO_FIELD_SUFFIX = '___pareto';

function getParetoField(valueField: string): string {
  return valueField + PARETO_FIELD_SUFFIX;
}

/**
 * Sorts the data by the value field descending and adds the calculated pareto value field.
 */
export class ParetoSeriesDataPreprocessor implements ICommonChartTabularDataPreProcessor {
  constructor(
    private readonly valueField: string,
  ) {
  }

  private readonly paretoField = getParetoField(this.valueField);

  preProcessTabular(dataset: CommonVizTabularDataset) {
    dataset.sort((a, b) => this._getValue(b) - this._getValue(a));

    const total = dataset.reduce(
      (accumulator, currentEntry) => accumulator + this._getValue(currentEntry),
      0,
    );

    let runningTotal = 0;
    for (const entry of dataset) {
      const value = this._getValue(entry);
      runningTotal += value;

      entry[this.paretoField] = runningTotal / total * 100;
    }
  }

  private _getValue(entry: CommonVizTabularRow): any {
    return entry[this.valueField];
  }
}
