import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
  DynamicComponentOutletDirective
} from "../../../../@shared/dynamic-component/dynamic-component-outlet.directive";
import {
  DynamicComponentBlueprint,
  DynamicComponentInputs
} from "../../../../@shared/dynamic-component/dynamic-component.blueprint";
import {TILE_CONTENT_DATA_INPUT} from "../shared";
import {TABLE_BLUEPRINT_INPUT} from "./simple-table.inputs";
import {CommonTileCardComponent} from "../common-tile-card/common-tile-card.component";

@Component({
  standalone: true,
  imports: [DynamicComponentOutletDirective, CommonTileCardComponent],
  template: `
    <app-dash-common-tile-card>
      <ng-container
        [appDynamicComponentOutlet]="tableBlueprint"
        [optionalInputs]="tableInputs"/>
    </app-dash-common-tile-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTableComponent {
  @Input(TABLE_BLUEPRINT_INPUT)
  public tableBlueprint?: DynamicComponentBlueprint<any>;

  @Input(TILE_CONTENT_DATA_INPUT)
  data?: unknown;

  protected get tableInputs(): DynamicComponentInputs {
    // Just forward the data
    return {
      [TILE_CONTENT_DATA_INPUT]: this.data,
    };
  }
}
