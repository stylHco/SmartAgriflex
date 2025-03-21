import { Pipe, PipeTransform } from "@angular/core";
import {CommonVizDataContainer, DEFAULT_DATASET} from "../../../../../@shared/charts/common-viz-data";
import {doubleSeriesChart, singleSeriesChart} from "../charts-interfaces/charts-interfaces.component";

@Pipe({
  name: 'TransformSingleBarChartPipe',
  standalone: true,
  pure: true
})
export class TransformSingleBarChartPipe implements PipeTransform {
  transform(data: singleSeriesChart[]): CommonVizDataContainer {

    const transformedData = data.map(counts => ({
      data: counts.label,
      value: counts.value,
    }));

    return {
      [DEFAULT_DATASET]: transformedData,
    };
  }

}
