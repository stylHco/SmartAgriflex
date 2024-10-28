import {APP_INITIALIZER, inject, NgModule} from '@angular/core';
import {ThemingService} from "./theming.service";

function initTheming(): () => void {
  const service = inject(ThemingService);

  return () => {
    return service.init();
  };
}

// MUST BE imported in the root module!
@NgModule({
  providers: [
    ThemingService,
    {
      provide: APP_INITIALIZER,
      useFactory: initTheming,
      multi: true,
    }
  ],
})
export class ThemeManagementModule {
}
