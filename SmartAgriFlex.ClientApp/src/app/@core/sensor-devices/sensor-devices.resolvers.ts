import {wrapResolverApiResult} from "../../@shared/utils/api-result";
import {inject} from "@angular/core";
import {SensorDevicesClient} from "../app-api";

export const resolveSensorDevicesList = wrapResolverApiResult(() => inject(SensorDevicesClient).list());

export const resolveSensorDevicesDropdown = wrapResolverApiResult(() => inject(SensorDevicesClient).listForReference());

export const resolveSensorDeviceDetails = wrapResolverApiResult(
  route => inject(SensorDevicesClient)
    .get(+route.paramMap.get('id')!)
);

export const resolveSensorDeviceForUpdate = wrapResolverApiResult(
  route => inject(SensorDevicesClient)
    .getForUpdate(+route.paramMap.get('id')!)
);
