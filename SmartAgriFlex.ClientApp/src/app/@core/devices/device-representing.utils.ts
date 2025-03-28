import {ChangeDetectionStrategy, Component, inject, Injectable, Input} from '@angular/core';
import {Changeable, changeableFromConstValue, ChangeableValuePipe} from "../../@shared/utils/changeable";
import {Observable} from "rxjs";
import {RepresentingOption, getRepresentingOptions$} from "../../@shared/utils/representing-helpers";
import {IDeviceReferenceModel} from "../app-api";

export type DeviceIdentifyingProps = Pick<IDeviceReferenceModel, 'id'>;
export type DeviceRepresentingProps = Pick<IDeviceReferenceModel, 'name' | 'nickname'>;

export type DeviceReferencingProps = DeviceIdentifyingProps & DeviceRepresentingProps;

export type DeviceOption<TEntry = never> = RepresentingOption<DeviceIdentifyingProps, TEntry>;

@Injectable({
  providedIn: 'root'
})
export class DeviceRepresentingService {
  public getLabel(device: DeviceRepresentingProps): Changeable<string> {
    const name = device.name
    const nickname = device.nickname

    return changeableFromConstValue(`${name} ${nickname}`);
  }

  public getOptions<TEntry extends DeviceReferencingProps>(
    devices: TEntry[],
  ): Observable<DeviceOption<TEntry>[]> {
    return getRepresentingOptions$(
      devices,
      device => this.getLabel(device),
      device => ({id: device.id}),
    );
  }
}

@Component({
  selector: 'app-device-representing',
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
export class DeviceRepresentingComponent {
  protected readonly representingService = inject(DeviceRepresentingService);

  @Input()
  set device(device: DeviceRepresentingProps | null | undefined) {
    this.labelChangeable = device
      ? this.representingService.getLabel(device)
      : undefined;
  }

  protected labelChangeable?: Changeable<string>;
}
