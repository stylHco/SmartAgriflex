import {NgModule} from '@angular/core';
import {WhenLoadedDirective} from './directives/when-loaded.directive';
import {WhenLoadingDirective} from './directives/when-loading.directive';
import {LoadableAutoManageDirective} from './directives/loadable-auto-manage.directive';
import {WhenFailedDirective} from './directives/when-failed.directive';
import {WhenLoadedAllDirective} from './directives/when-loaded-all.directive';
import {WhenLoadingAnyDirective} from './directives/when-loading-any.directive';
import {WhenCompletedWithFailedDirective} from './directives/when-completed-with-failed.directive';

@NgModule({
  declarations: [
    WhenLoadedDirective,
    WhenLoadingDirective,
    LoadableAutoManageDirective,
    WhenFailedDirective,
    WhenLoadedAllDirective,
    WhenLoadingAnyDirective,
    WhenCompletedWithFailedDirective,
  ],
  exports: [
    WhenLoadedDirective,
    WhenLoadingDirective,
    LoadableAutoManageDirective,
    WhenFailedDirective,
    WhenLoadedAllDirective,
    WhenLoadingAnyDirective,
    WhenCompletedWithFailedDirective,
  ]
})
export class LoadablesTemplateUtilsModule {
}
