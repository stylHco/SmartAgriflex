import {wrapResolverApiResult} from "../../@shared/utils/api-result";
import {inject} from "@angular/core";
import {SensorsClient} from "../app-api";

export const resolveSensorsList = wrapResolverApiResult(() => inject(SensorsClient).list());

export const resolveSensorsDropdown = wrapResolverApiResult(() => inject(SensorsClient).listForReference());

export const resolveSensorDetails = wrapResolverApiResult(
  route => inject(SensorsClient)
    .get(+route.paramMap.get('id')!)
);

export const resolveSensorForUpdate = wrapResolverApiResult(
  route => inject(SensorsClient)
    .getForUpdate(+route.paramMap.get('id')!)
);
