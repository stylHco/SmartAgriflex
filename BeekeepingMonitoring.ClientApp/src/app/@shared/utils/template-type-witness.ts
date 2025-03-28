import {Directive, Input, NgIterable, NgModule} from '@angular/core';

// The item-of-array version
@Directive({
  selector: 'ng-template[appWitnessIterable]'
})
export class TemplateTypeItemsWitnessDirective<TItem> {
  @Input('appWitnessIterable')
  items!: NgIterable<TItem>;

  static ngTemplateContextGuard<TItem>(
    directive: TemplateTypeItemsWitnessDirective<TItem>,
    context: unknown
  ): context is { $implicit: TItem } {
    return true;
  }
}

@NgModule({
  declarations: [
    TemplateTypeItemsWitnessDirective,
  ],
  exports: [
    TemplateTypeItemsWitnessDirective,
  ],
})
export class TemplateTypeWitnessModule {
}
