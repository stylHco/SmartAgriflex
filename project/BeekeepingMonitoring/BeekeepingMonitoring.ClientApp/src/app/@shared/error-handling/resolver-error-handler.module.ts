import {APP_INITIALIZER, NgModule} from '@angular/core';
import {ResolverErrorHandlerService} from "./resolver-error-handler.service";

function startErrorHandler(handler: ResolverErrorHandlerService): () => void {
  return () => {
    return handler.enable();
  };
}

// MUST BE imported in the root module!
@NgModule({
  providers: [
    ResolverErrorHandlerService,
    {
      provide: APP_INITIALIZER,
      useFactory: startErrorHandler,
      deps: [ResolverErrorHandlerService],
      multi: true,
    }
  ],
})
export class ResolverErrorHandlerModule {
}
