import {ChangeDetectionStrategy, Component, inject, Injectable, Input} from '@angular/core';
import {Changeable, changeableFromConstValue, ChangeableValuePipe} from "../../@shared/utils/changeable";
import {Observable} from "rxjs";
import {RepresentingOption, getRepresentingOptions$} from "../../@shared/utils/representing-helpers";
import {ICustomRuleReferenceModel} from "../app-api";
export type CustomRuleIdentifyingProps = Pick<ICustomRuleReferenceModel, 'id'>;
export type CustomRuleRepresentingProps = Pick<ICustomRuleReferenceModel, 'id' | 'sensor' | 'programDirective' |  'ruleText'>;

export type CustomRuleReferencingProps = CustomRuleIdentifyingProps & CustomRuleRepresentingProps;

export type CustomRuleOption<TEntry = never> = RepresentingOption<CustomRuleIdentifyingProps, TEntry>;

@Injectable({
  providedIn: 'root'
})
export class CustomRuleRepresentingService {
  public getLabel(customRule: CustomRuleRepresentingProps): Changeable<string> {
    let sensor = customRule.sensor;
    let programDirective = customRule.programDirective;
    let ruleText = customRule.ruleText;

    return changeableFromConstValue(String(`${customRule.id}, ${sensor.name},| ${programDirective}, ${ruleText}`));
  }

  public getOptions<TEntry extends CustomRuleReferencingProps>(
    customRules: TEntry[],
  ): Observable<CustomRuleOption<TEntry>[]> {
    return getRepresentingOptions$(
      customRules,
      customRule => this.getLabel(customRule),
      customRules => ({id: customRules.id}),
    );
  }
}

@Component({
  selector: 'app-sensor-device-representing',
  standalone: true,
  imports: [ChangeableValuePipe],
  template: `
    {{ labelChangeable | changeableValue }}
  `,
  styles: [
    ':host {display: contents}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomRuleRepresentingComponent {
  protected readonly representingService = inject(CustomRuleRepresentingService);

  @Input()
  set customRule(customRule: CustomRuleRepresentingProps | null | undefined) {
    this.labelChangeable = customRule
      ? this.representingService.getLabel(customRule)
      : undefined;
  }

  protected labelChangeable?: Changeable<string>;
}
