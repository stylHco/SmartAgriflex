import {DashboardIntervalTypeEnum, SensorDataFullDetailsModelWithRules} from "../../../../@core/app-api";
import {BarChartInterface} from "../components/bar-chart-interface";

export function transformBarChartData(
  data: SensorDataFullDetailsModelWithRules[],
  interval: DashboardIntervalTypeEnum
): BarChartInterface[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn("TransformBarChartPipe: Received empty or invalid data.");
    return [];
  }

  const groupedData: { [key: string]: { totalValue: number; count: number; color: string } } = {};

  data.forEach(entry => {
    if (!entry || entry.value === undefined || !entry.recordDate || !entry.rule) {
      console.warn("Skipping invalid entry:", entry);
      return;
    }

    const date = new Date(entry.recordDate);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date format:", entry.recordDate);
      return;
    }

    const label = getLabelByInterval(date, interval, data);

    if (!groupedData[label]) {
      groupedData[label] = { totalValue: 0, count: 0, color: entry.rule };
    }

    groupedData[label].totalValue += entry.value!;
    groupedData[label].count += 1;
  });

  return Object.keys(groupedData).map(label => ({
    label: label,
    value: roundUpTo(groupedData[label].totalValue / groupedData[label].count, 2),
    color: groupedData[label].color // Ensure valid color strings
  }));
}


function getLabelByInterval(date: Date, interval: DashboardIntervalTypeEnum, data: SensorDataFullDetailsModelWithRules[]): string {
  switch (interval) {
    case 'Hourly':
      return `${date.getHours()}:00`;

    case 'Daily':
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} (${getDayName(date)})`;

    case 'Weekly':
      return `Week ${getRelativeWeekNumber(date, data)}`;

    case 'Monthly':
      return `${date.getFullYear()} - ${getMonthName(date)}`;

    case 'Yearly':
      return `${date.getFullYear()}`;

    default:
      return date.toISOString(); // Fallback
  }
}

// Function to get the day name (e.g., Monday, Tuesday)
function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Function to get the month name (e.g., January, February)
function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

// Function to get relative week number based on data, not actual week of year
function getRelativeWeekNumber(date: Date, data: SensorDataFullDetailsModelWithRules[]): number {
  const uniqueWeeks = Array.from(
    new Set(
      data.map(entry => {
        const entryDate = new Date(entry.recordDate);
        return `${entryDate.getFullYear()}-${getWeekNumberInMonth(entryDate)}`;
      })
    )
  ).sort();

  return uniqueWeeks.indexOf(`${date.getFullYear()}-${getWeekNumberInMonth(date)}`) + 1;
}

// Function to get the week number within a month
function getWeekNumberInMonth(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
}

function roundUpTo(number: number, upto: number) {
  return Number(number.toFixed(upto));
}
