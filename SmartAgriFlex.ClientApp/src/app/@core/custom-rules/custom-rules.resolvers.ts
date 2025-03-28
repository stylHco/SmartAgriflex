import {wrapResolverApiResult} from "../../@shared/utils/api-result";
import {inject} from "@angular/core";
import {CustomRulesClient} from "../app-api";

export const resolveCustomRulesList = wrapResolverApiResult(() => inject(CustomRulesClient).list());

export const resolveCustomRulesDropdown = wrapResolverApiResult(() => inject(CustomRulesClient).listForReference());

export const resolveCustomRuleDetails = wrapResolverApiResult(
  route => inject(CustomRulesClient)
    .get(+route.paramMap.get('id')!)
);

export const resolveCustomRuleForUpdate = wrapResolverApiResult(
  route => inject(CustomRulesClient)
    .getForUpdate(+route.paramMap.get('id')!)
);
