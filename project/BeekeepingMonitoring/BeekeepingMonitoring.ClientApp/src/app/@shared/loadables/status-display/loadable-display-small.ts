import {ChangeDetectionStrategy, Component, ContentChild, Input, NgModule} from "@angular/core";
import {Loadable} from "../loadable";
import {WhenLoadingDirective} from "../template-utils/directives/when-loading.directive";
import {WhenFailedDirective} from "../template-utils/directives/when-failed.directive";
import {CommonModule} from "@angular/common";
import {LoadablesTemplateUtilsModule} from "../template-utils/loadables-template-utils.module";
import {LoadIndicatorSmallFailedRetryModule} from "../../load-indicators/failed/small-retry";
import {LoadIndicatorSmallSpinnerModule} from "../../load-indicators/unknown/small-spinner";

@Component({
  selector: 'app-loadable-d-small',
  template: `
    <ng-container *ngIf="!whenLoading">
      <app-l-ind-u-small-spinner *loadableWhenLoading="loadable">
      </app-l-ind-u-small-spinner>
    </ng-container>

    <ng-container *ngIf="!whenFailed">
      <app-l-ind-f-small-retry *loadableWhenFailed="loadable; let retry = retryFn"
                               (onRetry)="retry()">
      </app-l-ind-f-small-retry>
    </ng-container>

    <ng-content></ng-content>
  `,
  styles: [
    ':host {display: block}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadableDisplaySmallComponent {
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
    LoadIndicatorSmallFailedRetryModule,
    LoadIndicatorSmallSpinnerModule,
  ],
  declarations: [LoadableDisplaySmallComponent],
  exports: [LoadableDisplaySmallComponent],
})
export class LoadableDisplaySmallModule {
}
