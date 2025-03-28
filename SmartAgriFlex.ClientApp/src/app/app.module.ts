import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";
import {TranslocoRootModule} from "./@transloco/transloco-root.module";
import {MiscModule} from "./misc/misc.module";
import {ResolverErrorHandlerModule} from "./@shared/error-handling/resolver-error-handler.module";
import {PageTitleManagerModule} from "./@shared/page-title/page-title-manager.module";
import {CommonToastsModule} from "./toasts/common-toasts.module";
import {FormLossListenerModule} from "./@shared/form-loss-prevention/listener/form-loss-listener.module";
import {ThemeManagementModule} from "./@theme/management/theme-management.module";
import {ApiUrlProvidedVerifierProvider} from "./@shared/utils/api-url-provided-verifier";
import {RootJodaPatchInitializer} from "./@shared/date-time/joda-patchers";
import {RouterIndicatorComponent} from "./router-indicator/router-indicator.component";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // App-wide functionality
    // TODO: some of these should become host directives on app component
    TranslocoRootModule,
    PageTitleManagerModule,
    ResolverErrorHandlerModule,
    CommonToastsModule,
    FormLossListenerModule,
    ThemeManagementModule,
    RouterIndicatorComponent,

    // Non-lazy-loaded components
    MiscModule,

    // App configuration
    AppRoutingModule,
  ],
  providers: [
    ApiUrlProvidedVerifierProvider,
    RootJodaPatchInitializer,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
