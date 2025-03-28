import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TranslocoModule} from "@ngneat/transloco";
import {DynamicComponentBlueprint} from "../dynamic-component.blueprint";

const KEY_INPUT = 'key';

@Component({
  standalone: true,
  imports: [TranslocoModule],
  template: `
    {{ key | transloco }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TranslatedValueComponent {
  @Input(KEY_INPUT)
  key: string | null = null;
}

export function prepareTranslatedValue(key: string): DynamicComponentBlueprint<unknown> {
  return {
    componentType: TranslatedValueComponent,
    initSetInputs: {
      [KEY_INPUT]: key,
    },
  };
}

export function tryGetTranslationKey(bp: DynamicComponentBlueprint<unknown>): string | undefined {
  if (bp.componentType !== TranslatedValueComponent) return undefined;

  return bp.initSetInputs![KEY_INPUT] as string;
}
