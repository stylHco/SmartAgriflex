import {ChangeDetectionStrategy, Component, ContentChild, Input, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {LoadablesTemplateUtilsModule} from "../template-utils/loadables-template-utils.module";
import {LoadIndicatorMediumSpinnerModule} from "../../load-indicators/unknown/medium-spinner.";
import {LoadIndicatorMediumFailedRetryModule} from "../../load-indicators/failed/medium-retry";
import {Loadable} from "../loadable";
import {WhenLoadingDirective} from "../template-utils/directives/when-loading.directive";
import {WhenFailedDirective} from "../template-utils/directives/when-failed.directive";

@Component({
  selector: 'app-loadable-d-medium',
  template: `
    <ng-container *ngIf="!whenLoading">
      <app-l-ind-u-med-spinner *loadableWhenLoading="loadable"></app-l-ind-u-med-spinner>
    </ng-container>

    <ng-container *ngIf="!whenFailed">
      <app-l-ind-f-med-retry *loadableWhenFailed="loadable; let retry = retryFn"
                             (onRetry)="retry()">
      </app-l-ind-f-med-retry>
    </ng-container>

    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadableDisplayMediumComponent {
  @Input()
  public loadable?: Loadable<any>;

  @ContentChild(WhenLoadingDirective)
  whenLoading?: WhenLoadingDirective;

  @ContentChild(WhenFailedDirective)
  whenFailed?: WhenFailedDirective;
}

@NgModule({
  imports: [
    CommonModule,
    LoadablesTemplateUtilsModule,
    LoadIndicatorMediumSpinnerModule,
    LoadIndicatorMediumFailedRetryModule,
  ],
  declarations: [LoadableDisplayMediumComponent],
  exports: [LoadableDisplayMediumComponent],
})
export class LoadableDisplayMediumModule {
}
