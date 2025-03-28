import {ChangeDetectionStrategy, Component, inject, Injectable, Input} from '@angular/core';
import {Changeable, changeableFromConstValue, ChangeableValuePipe} from "../../@shared/utils/changeable";
import {Observable} from "rxjs";
import {RepresentingOption, getRepresentingOptions$} from "../../@shared/utils/representing-helpers";
import {ISensorReferenceModel} from "../app-api";

export type SensorIdentifyingProps = Pick<ISensorReferenceModel, 'id'>;
export type SensorRepresentingProps = Pick<ISensorReferenceModel, 'name'>;

export type SensorReferencingProps = SensorIdentifyingProps & SensorRepresentingProps;

export type SensorOption<TEntry = never> = RepresentingOption<SensorIdentifyingProps, TEntry>;

@Injectable({
  providedIn: 'root'
})
export class SensorRepresentingService {
  public getLabel(sensor: SensorRepresentingProps): Changeable<string> {
    return changeableFromConstValue(sensor.name);
  }

  public getOptions<TEntry extends SensorReferencingProps>(
    sensors: TEntry[],
  ): Observable<SensorOption<TEntry>[]> {
    return getRepresentingOptions$(
      sensors,
      sensor => this.getLabel(sensor),
      sensor => ({id: sensor.id}),
    );
  }
}

@Component({
  selector: 'app-sensor-representing',
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
export class SensorRepresentingComponent {
  protected readonly representingService = inject(SensorRepresentingService);

  @Input()
  set sensor(sensor: SensorRepresentingProps | null | undefined) {
    this.labelChangeable = sensor
      ? this.representingService.getLabel(sensor)
      : undefined;
  }

  protected labelChangeable?: Changeable<string>;
}
