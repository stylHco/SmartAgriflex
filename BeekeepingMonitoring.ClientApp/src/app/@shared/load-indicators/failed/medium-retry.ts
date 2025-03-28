import {ChangeDetectionStrategy, Component, EventEmitter, NgModule, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {TranslocoModule} from "@ngneat/transloco";

@Component({
  selector: 'app-l-ind-f-med-retry',
  template: `
    <ng-container *transloco="let t">
      <div class="content" (click)="onRetry.emit()">
        <i class="error pi pi-exclamation-triangle text-red-500"></i>
        <i class="retry pi pi-refresh"></i> <!-- TODO: colour this one? -->

        <div class="mt-2">{{ t('generic.loading_failed') }}</div>
        <div class="text-color-secondary">{{ t('generic.click_to_retry') }}</div>
      </div>
    </ng-container>
  `,
  styleUrls: ['./medium-retry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadIndicatorMediumFailedRetryComponent {
  @Output()
  public onRetry = new EventEmitter<void>();
}

@NgModule({
  imports: [
    ButtonModule,
    TranslocoModule,
  ],
  declarations: [LoadIndicatorMediumFailedRetryComponent],
  exports: [LoadIndicatorMediumFailedRetryComponent],
})
export class LoadIndicatorMediumFailedRetryModule {
}
