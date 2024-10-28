import {wrapResolverApiResult} from "../../@shared/utils/api-result";
import {inject} from "@angular/core";
import {DevicesClient} from "../app-api";

export const resolveDevicesList = wrapResolverApiResult(() => inject(DevicesClient).list());

export const resolveDevicesDropdown = wrapResolverApiResult(() => inject(DevicesClient).listForReference());

export const resolveDeviceDetails = wrapResolverApiResult(
  route => inject(DevicesClient)
    .get(+route.paramMap.get('id')!)
);

export const resolveDeviceForUpdate = wrapResolverApiResult(
  route => inject(DevicesClient)
    .getForUpdate(+route.paramMap.get('id')!)
);
