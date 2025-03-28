import {ChangeDetectorRef, Directive, NgModule, OnInit, Self} from '@angular/core';
import {Dropdown} from "primeng/dropdown";
import {TranslocoService} from "@ngneat/transloco";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

// TODO: rename this file

@UntilDestroy()
@Directive({
  selector: 'p-dropdown[appPlaceholder]',
})
export class DropdownDefaultPlaceholder implements OnInit {
  constructor(
    @Self() private readonly dropdown: Dropdown,
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
        this.dropdown.placeholder = value;
        this.cd.markForCheck();
      });
  }
}

@UntilDestroy()
@Directive({
  selector: 'p-dropdown[appFilterPlaceholder]',
})
export class DropdownDefaultFilterPlaceholder implements OnInit {
  constructor(
    @Self() private readonly dropdown: Dropdown,
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
        this.dropdown.filterPlaceholder = value;
        this.cd.markForCheck();
      });
  }
}

@NgModule({
  declarations: [
    DropdownDefaultPlaceholder,
    DropdownDefaultFilterPlaceholder,
  ],
  exports: [
    DropdownDefaultPlaceholder,
    DropdownDefaultFilterPlaceholder,
  ]
})
export class DropdownDefaultsModule {
}
