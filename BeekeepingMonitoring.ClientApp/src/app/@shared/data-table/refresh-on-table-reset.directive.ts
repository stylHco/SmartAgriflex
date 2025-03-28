import {ChangeDetectorRef, Directive, inject} from '@angular/core';
import {DataTableComponent} from "./data-table.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {autoMarkForCheck} from "../utils/change-detection-helpers";

@Directive({
  selector: '[dtRefreshOnTableReset]',
  standalone: true,
})
export class RefreshOnTableResetDirective {
  private readonly dataTableComponent = inject(DataTableComponent);
  private readonly cd = inject(ChangeDetectorRef);

  constructor() {
    this.dataTableComponent.tableReset
      .pipe(
        takeUntilDestroyed(),
        autoMarkForCheck(this.cd),
      )
      .subscribe();
  }
}
