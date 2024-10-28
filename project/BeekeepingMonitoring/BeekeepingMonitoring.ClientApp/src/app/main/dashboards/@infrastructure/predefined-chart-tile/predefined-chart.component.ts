import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonChartPresenterModule} from "../../../../@shared/charts/common-chart-presenter";
import {CommonVizDataContainer, CommonVizDataDescriptor} from "../../../../@shared/charts/common-viz-data";
import {CommonChartConfigureFn} from "../../../../@shared/charts/common-chart.structures";
import {CONFIGURE_FN_INPUT, DESCRIPTOR_INPUT} from "./predefined-chart.inputs";
import {TILE_CONTENT_DATA_INPUT} from "../shared";
import {CommonTileCardComponent} from "../common-tile-card/common-tile-card.component";

@Component({
  standalone: true,
  imports: [CommonChartPresenterModule, CommonTileCardComponent],
  template: `
    <app-dash-common-tile-card>
      <div class="chart-wrapper">
        <app-common-chart-presenter
          [data]="data"
          [dataDescriptor]="descriptor"
          [configureFn]="configureFn"/>
      </div>
    </app-dash-common-tile-card>
  `,
  styleUrls: ['./predefined-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredefinedChartComponent {
  @Input(DESCRIPTOR_INPUT)
  descriptor?: CommonVizDataDescriptor;

  @Input(CONFIGURE_FN_INPUT)
  configureFn?: CommonChartConfigureFn;

  @Input(TILE_CONTENT_DATA_INPUT)
  data?: CommonVizDataContainer;
}
