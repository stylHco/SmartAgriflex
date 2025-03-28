import {ChangeDetectorRef, Directive, NgModule, OnInit, Self} from '@angular/core';
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {TranslocoService} from "@ngneat/transloco";
import {Listbox} from "primeng/listbox";

@UntilDestroy()
@Directive({
  selector: 'p-listbox[appFilterPlaceholder]',
})
export class ListBoxDefaultFilterPlaceholder implements OnInit {
  constructor(
    @Self() private readonly listBox: Listbox,
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
        this.listBox.filterPlaceHolder = value;
        this.cd.markForCheck();
      });
  }
}

@NgModule({
  declarations: [ListBoxDefaultFilterPlaceholder],
  exports: [ListBoxDefaultFilterPlaceholder],
})
export class ListBoxDefaultsModule {
}
