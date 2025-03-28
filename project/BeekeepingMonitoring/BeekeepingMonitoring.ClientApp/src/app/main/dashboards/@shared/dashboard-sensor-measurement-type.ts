import {DashboardSensorTypeEnum} from "../../../@core/app-api";

export enum DashboardSensorMeasurementType
{
  Celsius = 'Celsius Degrees',
  Percent = 'Percent',
  MetersPerSecond = 'Meter Per Second',
  Degrees = 'Degrees',
  Lux = 'Lux',
}

export function getDashboardMeasurementTypeWithSymbols(sensorType: DashboardSensorTypeEnum): string | null{
  switch (sensorType) {
    case DashboardSensorTypeEnum.Temperature:
      return '<span class="mdi mdi-temperature-celsius"></span>';
    case DashboardSensorTypeEnum.Humidity:
      return '<span class="mdi mdi-percent-outline"></span>';
    case DashboardSensorTypeEnum.WindSpeed:
      return 'm/s';
    case DashboardSensorTypeEnum.WindDirection:
      return 'degrees';
    case DashboardSensorTypeEnum.Light:
      return 'Lux';
    default:
      return null;
  }
}


export function getDashboardMeasurementTypeText(sensorType: DashboardSensorTypeEnum): string{
  switch (sensorType) {
    case DashboardSensorTypeEnum.Temperature:
      return "°C";
    case DashboardSensorTypeEnum.Humidity:
      return "%"
    case DashboardSensorTypeEnum.WindSpeed:
      return "m/s"
    case DashboardSensorTypeEnum.WindDirection:
      return "Degrees"
    case DashboardSensorTypeEnum.Light:
      return "Lux"
    default:
      return DashboardSensorMeasurementType.Celsius
  }
}
