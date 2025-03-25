import {Pipe, PipeTransform} from "@angular/core";
import {DashboardIntervalTypeEnum, SensorDataFullDetailsModelWithRules} from "../../../../@core/app-api";

export interface BarChartInterface {
  label: string;
  value: number;
  color: string;
}

export function transformBarChartData(data: SensorDataFullDetailsModelWithRules[], interval: DashboardIntervalTypeEnum): BarChartInterface[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn("TransformSingleBarChartPipe: Received empty or invalid data.");
    return [];
  }

  const groupedData: { [key: string]: { totalValue: number; count: number; color: string } } = {};

  data.forEach(entry => {
    if (!entry || !entry.value || !entry.recordDate || !entry.rule) {
      console.warn("Skipping invalid entry:", entry);
      return;
    }

    const date = new Date(entry.recordDate);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date format:", entry.recordDate);
      return;
    }

    const label = getLabelByInterval(date, interval);

    if (!groupedData[label]) {
      groupedData[label] = {totalValue: 0, count: 0, color: entry.rule};
    }

    groupedData[label].totalValue += entry.value;
    groupedData[label].count += 1;
  });

  return Object.keys(groupedData).map(label => ({
    label: label,
    value: roundUpTo(groupedData[label].totalValue / groupedData[label].count,2),
    color: groupedData[label].color
  }));
}

function getLabelByInterval(date: Date, interval: DashboardIntervalTypeEnum): string {
  switch (interval) {
    case 'Hourly':
      return `${date.getHours()}:00`;
    case 'Daily':
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    case 'Weekly':
      return `W${getWeekNumber(date)}`;
    case 'Monthly':
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    default:
      return date.toISOString(); // Fallback
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
}

function roundUpTo(number: number, upto: number) {
  return Number(number.toFixed(upto));
}
