import {Component, forwardRef, Injectable, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {
  commonActionsColumnOptions,
  COMMON_ACTIONS_CONTEXT,
  CommonActionsContext,
} from "../../../@shared/data-table/columns/common-actions/common-actions.column";
import {ApiResult} from "../../../@shared/utils/api-result";
import {CommonModule} from "@angular/common";
import {TranslocoModule} from "@ngneat/transloco";
import {PanelModule} from "primeng/panel";
import {DataTableModule} from "../../../@shared/data-table/data-table.module";
import {ColumnSpec} from "../../../@shared/data-table/common";
import {Changeable} from "../../../@shared/utils/changeable";
import {MenuItem} from "primeng/api";
import {MenuTitleTranslation, MenuTranslatorService} from "../../../@shared/dynamic-menu/translated-menu";
import {DynamicMenuPipe} from "../../../@shared/dynamic-menu/dynamic-menu.pipe";
import {PanelHeaderActionsComponent} from "../../../@shared/panel-header-actions/panel-header-actions.component";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {
  SensorDevicesClient,
  SensorDevicesListModel,
  ISensorReferenceModel,
  IDeviceReferenceModel,
} from "../../../@core/app-api";
import {SensorDeviceRepresentingService} from "../../../@core/sensor-devices/sensor-device-representing.utils";
import {prepareTranslatedValue} from "../../../@shared/dynamic-component/common/translated-value.component";
import {buildNumericColumnOptions} from "../../../@shared/data-table/columns/numeric.column";
import {
  buildSingleReferenceColumnOptions,
} from "../../../@shared/data-table/columns/single-reference/single-reference.column";
import {SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {buildStringColumnOptions} from "../../../@shared/data-table/columns/string.column";

@UntilDestroy()
@Component({
  templateUrl: './list-sensor-devices.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,

    PanelModule,
    PanelHeaderActionsComponent,
    DynamicMenuPipe,
    DataTableModule,
  ],
  providers: [
    {
      provide: COMMON_ACTIONS_CONTEXT,
      useClass: forwardRef(() => ListSensorDevicesActionsContext),
    }
  ],
})
export class ListSensorDevicesComponent implements OnInit {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly sensorRepresentingService: SensorRepresentingService,
    private readonly deviceRepresentingService: DeviceRepresentingService,
  ) {
  }

  items: SensorDevicesListModel[] = [];

  protected panelMenu: Readonly<MenuItem[]> = [
    {
      icon: 'pi pi-plus',
      [MenuTitleTranslation]: {key: 'buttons.create'},
      routerLink: '../add',
    },
  ];

  columns: ColumnSpec[] = [
    {
      header: prepareTranslatedValue('sensorDevices.fields.id'),
      ...buildNumericColumnOptions('id'),
    },
    {
      header: prepareTranslatedValue('sensorDevices.fields.sensor'),
      globalFilter: 'sensor.name',
      sortField: 'sensor.name',
      ...buildSingleReferenceColumnOptions<ISensorReferenceModel>(
        'sensor',
        sensor => sensor.id,
        sensor => this.sensorRepresentingService.getLabel(sensor),
        sensor => ['../../sensors/view', sensor.id],
      ),
    },
    {
      header: prepareTranslatedValue('sensorDevices.fields.device'),
      ...buildSingleReferenceColumnOptions<IDeviceReferenceModel>(
        'device',
        device => device.id,
        device => this.deviceRepresentingService.getLabel(device),
        device => ['../../devices/view', device.id],
      ),
    },
    {
      header: prepareTranslatedValue('sensorDevices.fields.comments'),
      ...buildStringColumnOptions('comments'),
    },
    commonActionsColumnOptions,
  ];

  ngOnInit() {
    this.items = (this.activeRoute.snapshot.data['items'] as ApiResult<SensorDevicesListModel[]>).value!;

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }
}

@Injectable()
class ListSensorDevicesActionsContext implements CommonActionsContext<SensorDevicesListModel> {
  constructor(
    private readonly sensorDevicesClient: SensorDevicesClient,
    private readonly representingService: SensorDeviceRepresentingService,
  ) {
  }

  getViewLinkCommands(item: SensorDevicesListModel): any[] {
    return ['../view/', item.id];
  }

  getEditLinkCommands(item: SensorDevicesListModel): any[] {
    return ['../edit/', item.id];
  }

  getItemNameForDelete(item: SensorDevicesListModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  prepareDelete(item: SensorDevicesListModel): Observable<unknown> {
    return this.sensorDevicesClient.delete(item.id);
  }
}
