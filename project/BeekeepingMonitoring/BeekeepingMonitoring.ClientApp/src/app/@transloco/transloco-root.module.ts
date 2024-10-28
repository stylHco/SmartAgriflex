import {
  TRANSLOCO_LOADER,
  Translation,
  TranslocoLoader,
  TRANSLOCO_CONFIG,
  translocoConfig,
  TranslocoModule, TranslocoService
} from '@ngneat/transloco';
import {APP_INITIALIZER, Injectable, NgModule} from '@angular/core';
import {environment} from '../../environments/environment';
import {ADDITIONAL_LANGS, DEFAULT_LANG} from "../app-constants";
import {Observable} from "rxjs";
import {createTranslocoLoader} from "./transloco.helpers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ '../i18n/en.json'),
  lang => import(/* webpackChunkName: "i18n" */ `../i18n/${lang}.json`)
);

@Injectable({
  providedIn: "root", // TODO
})
class CustomLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> | Promise<Translation> {
    return translocoLoader[lang]();
  }
}

// If we `selectTranslate()` with a scope before translating without scope or using the directive,
// the main loader will never be called and we will be missing the non-scoped translations.
//
// See `resolveLoader()`, `TranslocoService::load()` -> `handleSuccess()` -> `setTranslation()`
// and `TranslocoService::isLoadedTranslation()` for why this happens. The directive calls
// `TranslocoService::_loadDependencies()`, which avoids this issue.
//
// This fixes the issue by delaying the app startup until the main loader has been used
// (which due to webpackMode: "eager" is very cheap and quick).
function startMainLoader(transloco: TranslocoService): () => Observable<any> {
  return () => {
    return transloco.load(transloco.getActiveLang());
  };
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: [DEFAULT_LANG, ...ADDITIONAL_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        missingHandler: {
          useFallbackTranslation: true,
          logMissingKey: true,
          allowEmpty: true,
        },
        reRenderOnLangChange: true,
        prodMode: environment.production,
      })
    },
    {provide: TRANSLOCO_LOADER, useClass: CustomLoader},
    {
      provide: APP_INITIALIZER,
      useFactory: startMainLoader,
      deps: [TranslocoService],
      multi: true,
    }
  ]
})
export class TranslocoRootModule {
}
