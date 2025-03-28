import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {LoadablesAggregate} from "../../../../@shared/loadables/loadable-aggregation";
import {Loadable, LoadableValueSource} from "../../../../@shared/loadables/loadable";
import {
  DynamicComponentBlueprint,
  DynamicComponentInputs
} from "../../../../@shared/dynamic-component/dynamic-component.blueprint";
import {
  LoadablesTemplateUtilsModule
} from "../../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {CardModule} from "primeng/card";
import {LoadIndicatorMediumSpinnerModule} from "../../../../@shared/load-indicators/unknown/medium-spinner.";
import {LoadIndicatorMediumFailedRetryModule} from "../../../../@shared/load-indicators/failed/medium-retry";
import {
  DynamicComponentOutletDirective
} from "../../../../@shared/dynamic-component/dynamic-component-outlet.directive";
import {TILE_CONTENT_DATA_INPUT, TileContentInputs} from "../shared";
import {TileStatusContainerComponent} from "./tile-status-container.component";

// For use only by TilesGridComponent!
@Component({
  selector: 'app-dash-tile-content',
  standalone: true,
  imports: [
    LoadablesTemplateUtilsModule,
    CardModule,
    LoadIndicatorMediumSpinnerModule,
    LoadIndicatorMediumFailedRetryModule,
    DynamicComponentOutletDirective,
    TileStatusContainerComponent,
  ],
  templateUrl: './tile-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileContentComponent {
  readonly loadables = new LoadablesAggregate({
    component: new Loadable<DynamicComponentBlueprint<any>>(),
    data: new Loadable<unknown>(),
  });

  @Input()
  public set componentSource(value: LoadableValueSource<DynamicComponentBlueprint<any>>) {
    this.loadables.loadables.component.source = value;
  }

  @Input()
  public set dataSource(value: LoadableValueSource<unknown>) {
    this.loadables.loadables.data.source = value;
  }

  getComponentInputs(dataValue: unknown): DynamicComponentInputs {
    return {
      [TILE_CONTENT_DATA_INPUT]: dataValue,
    } satisfies TileContentInputs; // TODO: type the component BP instead
  }
}
