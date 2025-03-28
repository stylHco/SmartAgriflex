import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {PredefinedVisualizationType} from "../../../../../@core/app-api";
import {EnumTranslationPipe} from "../../../../../@transloco/translated-enum";
import {PredefinedVisTypeSpec} from "../../../../../@core/dashboard/translated-enums";

export const CHART_TYPE_INPUT = 'CHART_TYPE';

export type PredefinedVisManageHeaderInputs = {
  [CHART_TYPE_INPUT]: PredefinedVisualizationType,
};

@Component({
  standalone: true,
  imports: [EnumTranslationPipe],
  template: `
    {{ chartType | appTranslateEnum:PredefinedVisTypeSpec }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredefinedVisManageHeaderComponent {
  protected readonly PredefinedVisTypeSpec = PredefinedVisTypeSpec;

  @Input(CHART_TYPE_INPUT)
  public chartType?: PredefinedVisualizationType;
}
