import {wrapResolverApiResult} from "../../@shared/utils/api-result";
import {inject} from "@angular/core";
import {SensorDeviceDatasClient} from "../app-api";

export const resolveSensorDeviceDatasList = wrapResolverApiResult(() => inject(SensorDeviceDatasClient).list());

export const resolveSensorDeviceDatasDropdown = wrapResolverApiResult(() => inject(SensorDeviceDatasClient).listForReference());

export const resolveSensorDeviceDataDetails = wrapResolverApiResult(
  route => inject(SensorDeviceDatasClient)
    .get(+route.paramMap.get('id')!)
);

export const resolveSensorDeviceDataForUpdate = wrapResolverApiResult(
  route => inject(SensorDeviceDatasClient)
    .getForUpdate(+route.paramMap.get('id')!)
);

export const resolveFullSensorsDeviceData= wrapResolverApiResult(route => inject(SensorDeviceDatasClient)
  .getForSensor(route.paramMap.get('sensorId')!,route.paramMap.get('deviceId')!));
