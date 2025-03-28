import {Routes} from "@angular/router";
import {TITLE_PROVIDER_KEY} from "../../@shared/page-title/page-title-provider";
import {translatedScopedTitle} from "../../@shared/page-title/common-title-providers";
import {FormLossPreventionGuard} from "../../@shared/form-loss-prevention/form-loss-prevention.guard";
import {PRESENT_404_KEY} from "../../@shared/error-handling/resolver-error-options";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {resolveSensorsDropdown} from "../../@core/sensors/sensors.resolvers";
import {resolveDevicesDropdown} from "../../@core/devices/devices.resolvers";
import {
  EditCustomRuleTitleProvider,
  ManageCustomRuleComponent
} from "./manage-custom-rules/manage-custom-rule.component";
import {
  resolveCustomRuleDetails,
  resolveCustomRuleForUpdate,
  resolveCustomRulesList
} from "../../@core/custom-rules/custom-rules.resolvers";
import {ListCustomRulesComponent} from "./list-custom-rules/list-custom-rules.component";
import {ViewCustomRuleComponent, ViewCustomRuleTitleProvider} from "./view-custom-rules/view-custom-rule.component";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-custom-rules/en.json'),
  lang => import(/* webpackChunkName: "custom-rules-i18n" */ `./i18n-custom-rules/${lang}.json`)
);

export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'customRules', loader: translocoLoader},
    },
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'list',
    },
    {
      path: 'add',
      component: ManageCustomRuleComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('manage.header.add'),
      },
      resolve: {
        sensors: resolveSensorsDropdown,
      },
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'edit/:id',
      component: ManageCustomRuleComponent,
      data: {
        [TITLE_PROVIDER_KEY]: EditCustomRuleTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveCustomRuleForUpdate,
        sensors: resolveSensorsDropdown,
      },
      providers: [
        EditCustomRuleTitleProvider,
      ],
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'list',
      component: ListCustomRulesComponent,
      resolve: {
        items: resolveCustomRulesList,
      },
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('list.header'),
      },
    },
    {
      path: 'view/:id',
      component: ViewCustomRuleComponent,
      data: {
        [TITLE_PROVIDER_KEY]: ViewCustomRuleTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveCustomRuleDetails,
      },
      providers: [
        ViewCustomRuleTitleProvider,
      ],
    },
  ],
}];
