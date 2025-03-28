import { MonthlySensorComparison } from "../../../../@core/app-api";
import {DoubleLineChartDateInterface} from "../components/double-line-chart-interface";
export function transformDoubleLineData(data: MonthlySensorComparison[]): DoubleLineChartDateInterface[] {
  return data.map(item => ({
    label: item.month,
    line1: item.year1Value,
    line2: item.year2Value
  }));
}
