import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, NgModule, OnInit} from '@angular/core';
import {TranslocoService} from "@ngneat/transloco";
import {autoMarkForCheck} from "../../utils/change-detection-helpers";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'app-l-ind-u-small-spinner',
  template: `
    <i class="pi pi-spin pi-spinner"></i>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadIndicatorSmallSpinnerComponent implements OnInit {
  constructor(
    private readonly translocoService: TranslocoService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.translocoService.selectTranslate('generic.loading_ellipsis')
      .pipe(
        autoMarkForCheck(this.cd),
        untilDestroyed(this),
      )
      .subscribe(value => this.title = value);
  }

  @HostBinding('title')
  title?: string;
}

@NgModule({
  declarations: [LoadIndicatorSmallSpinnerComponent],
  exports: [LoadIndicatorSmallSpinnerComponent],
})
export class LoadIndicatorSmallSpinnerModule {
}
