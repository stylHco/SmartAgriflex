import {Component, Input, NgModule} from "@angular/core";
import {TILE_CONTENT_DATA_INPUT} from "../../../@infrastructure/shared";
import {SharedModule} from "primeng/api";
import {TableModule} from "primeng/table";
import {TemplateTypeWitnessModule} from "../../../../../@shared/utils/template-type-witness";

const imports = [
  SharedModule,
  TableModule,
  TemplateTypeWitnessModule,
];

@NgModule({
  imports: imports,
  exports: imports,
})
export class TableContentImportsModule {
}

@Component({
  standalone: true,
  imports: [TableContentImportsModule],
  template: ``,
})
export abstract class AbstractTableContentComponent<TContent> {
  @Input(TILE_CONTENT_DATA_INPUT)
  data!: TContent;
}
