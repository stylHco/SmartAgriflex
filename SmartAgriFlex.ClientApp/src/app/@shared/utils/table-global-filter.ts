import {Directive, Input, NgModule, OnChanges, Self, SimpleChanges} from '@angular/core';
import {Table} from "primeng/table";

/**
 * Allows setting the global filter value via binding, instead of explicitly calling table's api
 */
@Directive({
  selector: 'p-table [globalFilterValue]'
})
export class TableGlobalFilterDirective implements OnChanges {
  @Input('globalFilterValue')
  filterValue: string = '';

  @Input('globalFilterMode')
  filterMode: string = 'contains';

  constructor(
    @Self() private readonly table: Table,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('filterValue') || changes.hasOwnProperty('filterMode')) {
      this.table.filterGlobal(this.filterValue, this.filterMode);
    }
  }
}

@NgModule({
  declarations: [TableGlobalFilterDirective],
  exports: [TableGlobalFilterDirective],
})
export class TableGlobalFilterModule {
}
