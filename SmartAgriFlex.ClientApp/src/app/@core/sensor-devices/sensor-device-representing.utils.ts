import {ChangeDetectionStrategy, Component, inject, Injectable, Input} from '@angular/core';
import {Changeable, changeableFromConstValue, ChangeableValuePipe} from "../../@shared/utils/changeable";
import {Observable} from "rxjs";
import {RepresentingOption, getRepresentingOptions$} from "../../@shared/utils/representing-helpers";
import {ISensorDeviceReferenceModel} from "../app-api";

export type SensorDeviceIdentifyingProps = Pick<ISensorDeviceReferenceModel, 'id'>;
export type SensorDeviceRepresentingProps = Pick<ISensorDeviceReferenceModel, 'id' | 'device' | 'sensor'>;

export type SensorDeviceReferencingProps = SensorDeviceIdentifyingProps & SensorDeviceRepresentingProps;

export type SensorDeviceOption<TEntry = never> = RepresentingOption<SensorDeviceIdentifyingProps, TEntry>;

@Injectable({
  providedIn: 'root'
})
export class SensorDeviceRepresentingService {
  public getLabel(sensorDevice: SensorDeviceRepresentingProps): Changeable<string> {
    let sensor = sensorDevice.sensor;
    let device = sensorDevice.device;
    return changeableFromConstValue(String(`${sensorDevice.id} ${sensor.name}, ${device.nickname}`));
  }

  public getOptions<TEntry extends SensorDeviceReferencingProps>(
    sensorDevices: TEntry[],
  ): Observable<SensorDeviceOption<TEntry>[]> {
    return getRepresentingOptions$(
      sensorDevices,
      sensorDevice => this.getLabel(sensorDevice),
      sensorDevice => ({id: sensorDevice.id}),
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
export class SensorDeviceRepresentingComponent {
  protected readonly representingService = inject(SensorDeviceRepresentingService);

  @Input()
  set sensorDevice(sensorDevice: SensorDeviceRepresentingProps | null | undefined) {
    this.labelChangeable = sensorDevice
      ? this.representingService.getLabel(sensorDevice)
      : undefined;
  }

  protected labelChangeable?: Changeable<string>;
}
