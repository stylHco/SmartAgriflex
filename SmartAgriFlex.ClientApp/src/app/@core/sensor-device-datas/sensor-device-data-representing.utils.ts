import {ChangeDetectionStrategy, Component, inject, Injectable, Input} from '@angular/core';
import {Changeable, changeableFromConstValue, ChangeableValuePipe} from "../../@shared/utils/changeable";
import {Observable} from "rxjs";
import {RepresentingOption, getRepresentingOptions$} from "../../@shared/utils/representing-helpers";
import {ISensorDeviceDataReferenceModel} from "../app-api";

export type SensorDeviceDataIdentifyingProps = Pick<ISensorDeviceDataReferenceModel, 'id'>;
export type SensorDeviceDataRepresentingProps = Pick<ISensorDeviceDataReferenceModel, 'id'>;

export type SensorDeviceDataReferencingProps = SensorDeviceDataIdentifyingProps & SensorDeviceDataRepresentingProps;

export type SensorDeviceDataOption<TEntry = never> = RepresentingOption<SensorDeviceDataIdentifyingProps, TEntry>;

@Injectable({
  providedIn: 'root'
})
export class SensorDeviceDataRepresentingService {
  public getLabel(sensorDeviceData: SensorDeviceDataRepresentingProps): Changeable<string> {
    return changeableFromConstValue(String(sensorDeviceData.id));
  }

  public getOptions<TEntry extends SensorDeviceDataReferencingProps>(
    sensorDeviceDatas: TEntry[],
  ): Observable<SensorDeviceDataOption<TEntry>[]> {
    return getRepresentingOptions$(
      sensorDeviceDatas,
      sensorDeviceData => this.getLabel(sensorDeviceData),
      sensorDeviceData => ({id: sensorDeviceData.id}),
    );
  }
}

@Component({
  selector: 'app-sensor-device-data-representing',
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
export class SensorDeviceDataRepresentingComponent {
  protected readonly representingService = inject(SensorDeviceDataRepresentingService);

  @Input()
  set sensorDeviceData(sensorDeviceData: SensorDeviceDataRepresentingProps | null | undefined) {
    this.labelChangeable = sensorDeviceData
      ? this.representingService.getLabel(sensorDeviceData)
      : undefined;
  }

  protected labelChangeable?: Changeable<string>;
}
