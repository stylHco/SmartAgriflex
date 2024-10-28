import {ChangeDetectorRef, Directive, NgModule, OnInit, Self} from '@angular/core';
import {TranslocoService} from "@ngneat/transloco";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {MultiSelect} from "primeng/multiselect";

@UntilDestroy()
@Directive({
  selector: 'p-multiSelect[appPlaceholder]',
})
export class MultiSelectDefaultPlaceholder implements OnInit {
  constructor(
    @Self() private readonly multiSelect: MultiSelect,
    private readonly transloco: TranslocoService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.transloco.selectTranslate('generic.click_to_select')
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(value => {
        this.multiSelect.placeholder = value;
        this.cd.markForCheck();
      });
  }
}

@UntilDestroy()
@Directive({
  selector: 'p-multiSelect[appFilterPlaceholder]',
})
export class MultiSelectDefaultFilterPlaceholder implements OnInit {
  constructor(
    @Self() private readonly multiSelect: MultiSelect,
    private readonly transloco: TranslocoService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.transloco.selectTranslate('generic.search')
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(value => {
        this.multiSelect.filterPlaceHolder = value;
        this.cd.markForCheck();
      });
  }
}

@NgModule({
  declarations: [
    MultiSelectDefaultPlaceholder,
    MultiSelectDefaultFilterPlaceholder,
  ],
  exports: [
    MultiSelectDefaultPlaceholder,
    MultiSelectDefaultFilterPlaceholder,
  ]
})
export class MultiSelectDefaultsModule {
}
