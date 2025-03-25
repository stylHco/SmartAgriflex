import {Pipe, PipeTransform} from "@angular/core";
import {CommonVizDataContainer, DEFAULT_DATASET} from "../../../../@shared/charts/common-viz-data";
import {DashboardIntervalTypeEnum, SensorDataFullDetailsModelWithRules} from "../../../../@core/app-api";

@Pipe({
  name: 'TransformSingleBarChartPipe',
  standalone: true,
  pure: true
})

export class TransformSingleBarChartPipe implements PipeTransform {
  transform(data: SensorDataFullDetailsModelWithRules[], interval: DashboardIntervalTypeEnum): CommonVizDataContainer {
    const groupedData: { [key: string]: { totalValue: number; count: number; color: string } } = {};

    data.forEach(entry => {
      let key: string;

      const date = new Date(entry.recordDate);

      switch (interval) {
        case 'Hourly':
          key = `${date.getHours()}:00`;
          break;
        case 'Daily':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          break;
        case 'Weekly':
          key = `W${this.getWeekNumber(date)}`;
          break;
        case 'Monthly':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
      }

      if (!groupedData[key!]) {
        groupedData[key!] = {totalValue: 0, count: 0, color: entry.rule};
      }

      groupedData[key!].totalValue += entry.value!;
      groupedData[key!].count += 1;
    });

    const transformedData = Object.keys(groupedData).map(key => ({
      dateTime: key,
      value: groupedData[key].totalValue / groupedData[key].count,
      color: groupedData[key].color
    }));

    console.log(transformedData);
    return {
      [DEFAULT_DATASET]: transformedData,
    };
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  }

}
