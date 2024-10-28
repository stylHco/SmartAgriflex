import {APP_INITIALIZER, NgModule} from '@angular/core';
import {PageTitleManagerService} from "./page-title-manager.service";

function startManager(manager: PageTitleManagerService): () => void {
  return () => {
    return manager.enable();
  };
}

// MUST BE imported in the root module!
@NgModule({
  providers: [
    PageTitleManagerService,
    {
      provide: APP_INITIALIZER,
      useFactory: startManager,
      deps: [PageTitleManagerService],
      multi: true,
    }
  ],
})
export class PageTitleManagerModule {
}
