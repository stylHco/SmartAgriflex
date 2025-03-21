import { Pipe, PipeTransform } from "@angular/core";
import {CommonVizDataContainer, DEFAULT_DATASET} from "../../../../@shared/charts/common-viz-data";
@Pipe({
  name: 'TransformDoubleBarChartPipe',
  standalone: true,
  pure: true
})
export class TransformDoubleBarChartPipe implements PipeTransform {
  transform(data: any[]): CommonVizDataContainer {

    const transformedData = data.map(counts => ({
      data: counts.label,
      value1: counts.value1,
      value2: counts.value2,
    }));


    return {
      [DEFAULT_DATASET]: transformedData,
    };
  }

}
