import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChildren, EventEmitter,
  forwardRef, inject,
  Injectable,
  Input, Output,
  QueryList,
  Self, TemplateRef, ViewChild
} from '@angular/core';
import {NamedTemplateDirective} from "../utils/named-template";
import {
  ColumnSpec,
  DataTableTemplatesProvider, DT_ALL_MODEL_INPUT,
  DT_ROW_MODEL_INPUT,
  DT_TEMPLATES_PROVIDER,
  DtCellInputs, DtFilterInputs, getDtFieldValue, GlobalFilterValueProvider
} from "./common";
import {Table} from "primeng/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {ExportToCsv} from "export-to-csv";
import {tryGetTranslationKey} from "../dynamic-component/common/translated-value.component";
import {TranslocoService} from "@ngneat/transloco";

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styles: [
    ':host { display: block }',
    'p-sortIcon ::ng-deep i { margin: 0!important; }',
    '.display-contents { display: contents; }',
  ],
  providers: [
    {
      provide: DT_TEMPLATES_PROVIDER,
      useClass: forwardRef(() => TemplatesProvider),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<TRowModel = Object> {
  private readonly translocoService = inject(TranslocoService);

  private readonly cd = inject(ChangeDetectorRef);

  @Input()
  columnSpecs: ColumnSpec[] = [];

  @Input()
  rowModels: TRowModel[] = [];

  @Input()
  dataKey?: string;

  @Input()
  expandableRows = false;

  @Input()
  rowExpansionTemplate?: TemplateRef<any>;

  /**
   * Used by CommonActionsCellComponent when a row is deleted.
   * We will probably want to rework this API in future.
   */
  @Output()
  readonly rowModelsChange = new EventEmitter<TRowModel[]>;

  @Output()
  readonly tableReset = new EventEmitter<void>;

  @ContentChildren(NamedTemplateDirective)
  templates?: QueryList<NamedTemplateDirective>;

  @ViewChild('table')
  protected table?: Table;

  protected globalFilterValue: string = '';

  protected exportingPdf = false;

  get globalFilterFields(): (string | GlobalFilterValueProvider)[] {
    return this.columnSpecs
      .map(spec => spec.globalFilter!)
      .filter(filter => !!filter);
  }

  getCellInputs(rowData: TRowModel): DtCellInputs {
    return {
      [DT_ROW_MODEL_INPUT]: rowData,
      [DT_ALL_MODEL_INPUT]: this.rowModels,
    };
  }

  getFilterInputs(): DtFilterInputs {
    return {
      [DT_ALL_MODEL_INPUT]: this.rowModels,
    };
  }

  protected resetTable(): void {
    this.globalFilterValue = '';
    this.table?.clear();

    this.tableReset.emit();
  }

  protected get tempDisablePagination(): boolean {
    return this.exportingPdf;
  }

  protected exportPdf(): void {
    this.exportingPdf = true;

    try {
      this.cd.detectChanges();

      const doc = new jsPDF('landscape');
      autoTable(doc, {html: this.table?.tableViewChild?.nativeElement});
      doc.save('Table.pdf');
    } finally {
      this.exportingPdf = false;
      this.cd.markForCheck();
    }
  }

  protected exportCsv(): void {
    const valueFetchers: CsvValueFetcher[] = [];
    const headers: string[] = [];

    let i = 0;
    for (const columnSpec of this.columnSpecs) {
      if (columnSpec.excludeFromExport) continue;

      const valueFetcher = this.getCsvValueFetcher(columnSpec);
      if (!valueFetcher) {
        console.warn('Cannot get fetcher for column, skipping export. ', columnSpec);
        continue;
      };

      headers.push(this.getCsvHeader(i, columnSpec));
      valueFetchers.push(valueFetcher);

      i++;
    }

    const rowsForWriting: string[][] = [];
    for (const rowModel of this.rowModels) {
      const rowValues = valueFetchers
        .map(fetcher => fetcher(rowModel))
        .map(value => {
          if (typeof value === 'string') return value;
          if (value === null || value === undefined) return '';

          return JSON.stringify(value);
        });

      rowsForWriting.push(rowValues);
    }

    const csvExporter = new ExportToCsv({
      showLabels: true,
      useKeysAsHeaders: false,

      headers: headers,
    });

    csvExporter.generateCsv(rowsForWriting);
  }

  private getCsvHeader(i: number, columnSpec: ColumnSpec): string {
    if (columnSpec.header) {
      let translationKey = tryGetTranslationKey(columnSpec.header);

      if (translationKey) {
        return this.translocoService.translate(translationKey);
      }
    }

    return 'Column ' + (i + 1);
  }

  private getCsvValueFetcher(columnSpec: ColumnSpec): CsvValueFetcher | undefined {
    if (columnSpec.exportValueFetcher) {
      return (rowModel) => columnSpec.exportValueFetcher!(rowModel);
    }

    if (columnSpec.sortField) {
      return (rowModel) => getDtFieldValue(rowModel, columnSpec.sortField!);
    }

    if (typeof columnSpec.globalFilter === 'function') {
      const callback = columnSpec.globalFilter;
      return (rowModel) => callback(rowModel);
    }

    return undefined;
  }
}

type CsvValueFetcher = (rowModel: unknown) => unknown;

@Injectable()
class TemplatesProvider implements DataTableTemplatesProvider {
  constructor(
    @Self() private readonly component: DataTableComponent,
  ) {
  }

  get templates(): QueryList<NamedTemplateDirective> {
    if (!this.component.templates) {
      throw 'DataTableTemplatesProvider::templates should not be accessed before DT content set lifecycle event';
    }

    return this.component.templates;
  }
}
