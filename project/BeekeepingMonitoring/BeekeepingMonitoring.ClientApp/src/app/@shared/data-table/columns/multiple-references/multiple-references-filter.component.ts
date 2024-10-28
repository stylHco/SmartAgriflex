import {ChangeDetectionStrategy, Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DT_ALL_MODEL_INPUT, DT_FIELD_PATH_INPUT, getDtFieldValue} from "../../common";
import {TableModule} from "primeng/table";
import {FormsModule} from "@angular/forms";
import {BehaviorSubject, EMPTY, Observable, switchMap} from "rxjs";
import {getRepresentingOptions$} from "../../../utils/representing-helpers";
import {FilterService} from "primeng/api";
import {ListboxModule} from "primeng/listbox";
import {TranslocoService} from "@ngneat/transloco";
import {Changeable, changeableFromPair} from "../../../utils/changeable";
import {EmptyReplacerModule} from "../../../display-substitution/empty-replacer";
import {DropdownModule} from "primeng/dropdown";
import {KEY_PROVIDER_INPUT, KeyProvider, LABEL_PROVIDER_INPUT, LabelProvider} from "../reference.shared";
import {
  FilterTemplateContextDirective,
  FilterValue,
  MaybeFilterValue,
  Option,
  OptionsInput
} from "../reference-filter.shared";
import {ensureFilterModeExists} from "../../../utils/filter-service.helpers";
import {RefreshOnTableResetDirective} from "../../refresh-on-table-reset.directive";

enum ManyMatchMode {
  Any,
  All,
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    FilterTemplateContextDirective,
    ListboxModule,
    EmptyReplacerModule,
    DropdownModule,
    RefreshOnTableResetDirective,
  ],
  templateUrl: './multiple-references-filter.component.html',
  styles: [
    `:host {
      display: contents;
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleReferencesFilterComponent implements OnInit, OnChanges {
  private readonly translocoService = inject(TranslocoService);
  private readonly filterService = inject(FilterService);

  // TODO: loc
  protected readonly modeOptions = [
    {value: ManyMatchMode.Any, label: 'Any'},
    {value: ManyMatchMode.All, label: 'All'},
  ];

  @Input(DT_ALL_MODEL_INPUT)
  public rowModels: unknown[] = [];

  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(KEY_PROVIDER_INPUT)
  public keyProvider?: KeyProvider;

  @Input(LABEL_PROVIDER_INPUT)
  public labelProvider?: LabelProvider;

  protected matchModeSelection: ManyMatchMode = ManyMatchMode.Any;

  private readonly optionsInputSubject = new BehaviorSubject<OptionsInput | null>(null);

  protected readonly options$: Observable<Option[]> = this._buildOptions$();

  ngOnInit(): void {
    ensureFilterModeExists(this.filterService, FilterModeAnySymbol, doFilterAny);
    ensureFilterModeExists(this.filterService, FilterModeAllSymbol, doFilterAll);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.rebuildOptionsInput();
  }

  protected getMatchModeKey(manyMode: ManyMatchMode): symbol {
    switch (manyMode) {
      case ManyMatchMode.Any:
        return FilterModeAnySymbol;

      case ManyMatchMode.All:
        return FilterModeAllSymbol;
    }

    throw 'Unreachable code';
  }

  private rebuildOptionsInput(): void {
    if (
      !this.fieldPath ||
      !this.keyProvider ||
      !this.labelProvider
    ) {
      this.optionsInputSubject.next(null);
      return;
    }

    this.optionsInputSubject.next({
      rowModels: this.rowModels,
      fieldPath: this.fieldPath,
      keyProvider: this.keyProvider,
      labelProvider: this.labelProvider,
    });
  }

  protected getMultiSelectValueFromFilter(filterValue: MaybeFilterValue): unknown[] | undefined {
    // Do not return a new array (`[]` or `[...expectedKeys]`) from here - causes CD loop
    return filterValue?.expectedKeys;
  }

  protected getFilterValueFromMultiSelect(multiSelectValue: unknown[]): MaybeFilterValue {
    // Return undefined so that the filter icon stops being highlighted
    if (multiSelectValue.length < 1) return undefined;

    return {
      expectedKeys: [...multiSelectValue],
      expectedKeysSet: new Set(multiSelectValue),
      keyProvider: this.keyProvider!,
    };

    // Technically there is a potential issue of desync of this.keyProvider here and the
    // one that was used for creation of options for multi select, which was used to
    // produce the value passed as argument here. However, it's not worth the effort
    // and code mess to fix it as it's extremely unlikely, as
    // * event listeners are called after the host's change detection
    // * currently this.keyProvider is set only when the component is initted for the first time
  }

  private readonly naChangeable: Changeable<string> = changeableFromPair(
    this.translocoService.selectTranslate('generic.na'),
    () => this.translocoService.translate('generic.na'),
  );

  private _buildOptions$(): Observable<Option[]> {
    return this.optionsInputSubject.pipe(
      // TODO: distinct?
      switchMap((input): Observable<Option[]> => {
        // Will be handled by `?? []` after the async pipe
        if (!input) return EMPTY;

        const optionsKeysSerialized = new Set<string | undefined>();
        const optionsEntries: unknown[] = [];
        let addEmpty = false;

        for (const rowModel of this.rowModels) {
          let fieldValue = getDtFieldValue(rowModel, input.fieldPath);

          if (!(fieldValue instanceof Array)) {
            console.error(
              'MultipleReferencesFilterComponent requires field values to be arrays, instead got ',
              fieldValue,
            );
            continue;
          }

          for (const element of fieldValue) {
            let key = input.keyProvider(element);
            let serialized = JSON.stringify(key);

            if (!optionsKeysSerialized.has(serialized)) {
              optionsKeysSerialized.add(serialized);
              optionsEntries.push(element);
            }
          }

          if (fieldValue.length < 1) {
            addEmpty = true;
          }
        }

        // Always show empty option as the last
        if (addEmpty) optionsEntries.push(undefined);

        return getRepresentingOptions$(
          optionsEntries,
          entry => !entry ? this.naChangeable : input.labelProvider(entry),
          entry => !entry ? undefined : input.keyProvider(entry),
        );
      }),
    );
  }
}

const FilterModeAnySymbol = Symbol();
const FilterModeAllSymbol = Symbol();

function doFilterAny(currentValue: any, filterValue: FilterValue | undefined): boolean {
  return doFilter(currentValue, filterValue, ManyMatchMode.Any);
}

function doFilterAll(currentValue: any, filterValue: FilterValue | undefined): boolean {
  return doFilter(currentValue, filterValue, ManyMatchMode.All);
}

function doFilter(currentValue: any, filterValue: FilterValue | undefined, mode: ManyMatchMode): boolean {
  // Filter value could be not set (e.g. when table is just opened)
  if (!filterValue) return true;

  // Nothing is selected in the dropdown
  if (filterValue.expectedKeys.length < 1) return true;

  // We must have an array
  if (!(currentValue instanceof Array)) {
    return false;
  }

  // Empty case
  if (currentValue.length < 1) {
    return filterValue.expectedKeysSet.has(undefined);
  }

  const currentKeys = currentValue
    .map(currentElement => filterValue.keyProvider(currentElement));

  switch (mode) {
    case ManyMatchMode.Any:
      return currentKeys.some(currentKey => filterValue.expectedKeysSet.has(currentKey));

    case ManyMatchMode.All:
      const currentKeysSet = new Set(currentKeys);

      return filterValue.expectedKeys
        .filter(expectedKey => expectedKey !== undefined && !currentKeysSet.has(expectedKey))
        .length < 1;
  }

  throw 'Unreachable code';
}
