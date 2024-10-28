import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  NgModule, OnInit,
  Output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslocoModule, TranslocoService} from "@ngneat/transloco";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {autoMarkForCheck} from "../../utils/change-detection-helpers";

@UntilDestroy()
@Component({
  selector: 'app-l-ind-f-small-retry',
  template: `
    <ng-container *transloco="let t">
      <i class="error pi pi-exclamation-triangle text-red-500"></i>

      <div class="ml-1">{{ t('generic.loading_failed') }}</div>
    </ng-container>
  `,
  styleUrls: ['./small-retry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadIndicatorSmallFailedRetryComponent implements OnInit {
  @Output()
  public onRetry = new EventEmitter<void>();

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.translocoService.selectTranslate('generic.click_to_retry')
      .pipe(
        autoMarkForCheck(this.cd),
        untilDestroyed(this),
      )
      .subscribe(value => this.title = value);
  }

  @HostBinding('title')
  title?: string;

  @HostListener('click')
  onClick(): void {
    this.onRetry.emit();
  }
}

@NgModule({
  imports: [
    CommonModule,
    TranslocoModule,
  ],
  declarations: [LoadIndicatorSmallFailedRetryComponent],
  exports: [LoadIndicatorSmallFailedRetryComponent],
})
export class LoadIndicatorSmallFailedRetryModule {
}
