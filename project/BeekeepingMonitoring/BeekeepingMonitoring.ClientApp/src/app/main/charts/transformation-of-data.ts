import {
  SensorDateStatistics,
  SensorsDataDetailsModel,
  SensorsDataFullDetailsModel,
  SensorsDataListModel,
  SensorsDataStatistics
} from "../../@core/app-api";

export enum EChartAvailableData {
  value = "Value",
  sum = "Sum",
  avg = "Average",
  min = "Min",
  max = "Max"
}

export interface TransformedData {
  deviceName: string;
  sensorName: string;
  data: { date: Date; value: number }[];
}

export function transformData(inputData: SensorsDataDetailsModel[]): TransformedData[] {
  const sensorDataMap: {
    [sensorId: number]: { deviceName: string; sensorName: string; data: { date: Date; value: number }[] }
  } = {};

  inputData.forEach(record => {
    const deviceName = record.sensorDevice.device.name;
    const sensorName = record.sensorDevice.sensor.name;
    const date = new Date(record.recordDate);

    if (!sensorDataMap[record.sensorDevice.id]) {
      sensorDataMap[record.sensorDevice.id] = {deviceName, sensorName, data: []};
    }

    sensorDataMap[record.sensorDevice.id].data.push({date, value: record.value});
  });

  return Object.values(sensorDataMap);
}

export function transformDataForSpecificSensors(inputData: { [sensorId: string]: SensorDateStatistics[] }, selectedSeries: EChartAvailableData[]): TransformedData[] {
  const result: TransformedData[] = [];

  Object.keys(inputData).forEach(sensorId => {
    const sensorRecords = inputData[sensorId];

    const valuesData: { date: Date; value: number }[] = [];
    const minValuesData: { date: Date; value: number }[] = [];
    const maxValuesData: { date: Date; value: number }[] = [];
    const averageValuesData: { date: Date; value: number }[] = [];
    const sumValuesData: { date: Date; value: number }[] = [];

    sensorRecords.forEach(record => {
      const date = new Date(record.recordedDate);

      if (selectedSeries.includes(EChartAvailableData.value)) {
        valuesData.push({ date, value: record.avg }); // Assuming "value" corresponds to "avg" in the input data
      }
      if (selectedSeries.includes(EChartAvailableData.min)) {
        minValuesData.push({ date, value: record.min });
      }
      if (selectedSeries.includes(EChartAvailableData.max)) {
        maxValuesData.push({ date, value: record.max });
      }
      if (selectedSeries.includes(EChartAvailableData.avg)) {
        averageValuesData.push({ date, value: record.avg });
      }
      if (selectedSeries.includes(EChartAvailableData.sum)) {
        sumValuesData.push({ date, value: record.sum });
      }
    });

    // Assuming deviceName and sensorName are derived from sensorId, or predefined mappings are available
    const deviceName = `Device ${sensorId}`;
    const sensorName = `Sensor ${sensorId}`;

    if (valuesData.length > 0) {
      result.push({ deviceName, sensorName, data: valuesData });
    }
    if (minValuesData.length > 0) {
      result.push({ deviceName, sensorName, data: minValuesData });
    }
    if (maxValuesData.length > 0) {
      result.push({ deviceName, sensorName, data: maxValuesData });
    }
    if (averageValuesData.length > 0) {
      result.push({ deviceName, sensorName, data: averageValuesData });
    }
    if (sumValuesData.length > 0) {
      result.push({ deviceName, sensorName, data: sumValuesData });
    }
  });

  return result;
}

export function transformData2(inputData: SensorsDataFullDetailsModel[]): TransformedData[] {
  if (inputData.length === 0) {
    return [];
  }

  const deviceName = inputData[0].sensorDevice.device.name ?? 'Unknown Device';
  const sensorName = inputData[0].sensorDevice.sensor.name ?? 'Unknown Sensor';

  const valuesData: { date: Date; value: number }[] = [];

  inputData.forEach(record => {
    const date = new Date(record.recordDate);
    valuesData.push({date, value: record.value});
  });

  const result: TransformedData[] = [];

  if (valuesData.length > 0) {
    result.push({deviceName, sensorName, data: valuesData});
  }

  return result;

}
