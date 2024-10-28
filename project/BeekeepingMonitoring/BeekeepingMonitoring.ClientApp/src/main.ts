import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {APP_API_BASE_URL} from "./app/@core/app-api";
import {patchJodaGlobal} from "./app/@shared/date-time/joda-patchers";

if (environment.production) {
  enableProdMode();
}

patchJodaGlobal();

platformBrowserDynamic([
  {
    provide: APP_API_BASE_URL, useFactory: () => {
      let href = document.getElementsByTagName('base')[0].href;

      // NSwag-generated clients break if the base ends with a slash
      if (href.endsWith('/')) {
        href = href.substring(0, href.length - 1);
      }

      return href;
    }
  },
])
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
