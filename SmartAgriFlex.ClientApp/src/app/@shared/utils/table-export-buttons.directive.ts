import {Directive, EventEmitter, Output} from '@angular/core';
import {MenuItem} from "primeng/api";

@Directive({
  selector: '[appTableExportMenuSource]',
  exportAs: 'exportMenuSource',
  standalone: true
})
export class TableExportButtonsDirective {
  @Output()
  public readonly exportExcel = new EventEmitter<void>;

  @Output()
  public readonly exportCsv = new EventEmitter<void>;

  @Output()
  public readonly exportPdf = new EventEmitter<void>;

  // TODO: loc
  public readonly menu: MenuItem[] = [
    {
      title: 'Export to CSV',
      icon: 'mdi mdi-file-delimited-outline text-lg',
      command: () => this.exportCsv.emit(),
    },
    {
      title: 'Export to excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel.emit(),
    },
    {
      title: 'Export to PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPdf.emit(),
    },
  ];
}
