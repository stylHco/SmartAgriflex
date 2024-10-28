import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {AnalysisPresenterModule} from "../../../../@shared/analysis-presenter/analysis-presenter.module";
import {TILE_CONTENT_DATA_INPUT} from "../shared";
import {AnalysisPresentationInstructions} from "../../../../@core/analysis-engine/presentation-instructions";
import {CommonTileCardComponent} from "../common-tile-card/common-tile-card.component";

@Component({
  standalone: true,
  imports: [AnalysisPresenterModule, CommonTileCardComponent],
  template: `
    <app-dash-common-tile-card>
      <app-analysis-presenter [instructions]="instructions"/>
    </app-dash-common-tile-card>
  `,
  styleUrls: ['./analysis-flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisFlowComponent {
  @Input(TILE_CONTENT_DATA_INPUT)
  instructions?: AnalysisPresentationInstructions;
}
