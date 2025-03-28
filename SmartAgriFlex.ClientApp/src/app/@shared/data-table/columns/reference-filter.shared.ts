import {KeyProvider, LabelProvider} from "./reference.shared";
import {Directive} from "@angular/core";
import {FilterMetadata} from "primeng/api";
import {RepresentingOption} from "../../utils/representing-helpers";

export type FilterValue = {
  keyProvider: KeyProvider;

  expectedKeys: unknown[];
  expectedKeysSet: Set<unknown>;

  // We need the array to maintain the selection order when the filter dropdown is closed
  // and we need the set for faster lookup as filters are called a lot
};

export type MaybeFilterValue = FilterValue | undefined;

export type OptionsInput = Readonly<{
  rowModels: unknown[];
  fieldPath: string;
  keyProvider: KeyProvider;
  labelProvider: LabelProvider;
}>;

export type Option = RepresentingOption<unknown | undefined, any>;

type FilterTemplateContext = {
  $implicit: MaybeFilterValue;
  filterConstraint: FilterMetadata;
  filterCallback: (newValue: MaybeFilterValue) => void;
};

@Directive({
  selector: 'appReferenceFilterContext',
  standalone: true,
})
export class FilterTemplateContextDirective {
  static ngTemplateContextGuard(
    directive: FilterTemplateContextDirective,
    context: unknown
  ): context is FilterTemplateContext {
    return true;
  }
}
