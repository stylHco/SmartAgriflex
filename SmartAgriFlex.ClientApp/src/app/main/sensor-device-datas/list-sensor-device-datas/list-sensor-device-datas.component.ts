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
  SensorDeviceDatasClient,
  SensorDeviceDatasListModel,
  ISensorDeviceReferenceModel,
} from "../../../@core/app-api";
import {
  SensorDeviceDataRepresentingService,
} from "../../../@core/sensor-device-datas/sensor-device-data-representing.utils";
import {prepareTranslatedValue} from "../../../@shared/dynamic-component/common/translated-value.component";
import {buildNumericColumnOptions} from "../../../@shared/data-table/columns/numeric.column";
import {
  buildSingleReferenceColumnOptions,
} from "../../../@shared/data-table/columns/single-reference/single-reference.column";
import {SensorDeviceRepresentingService} from "../../../@core/sensor-devices/sensor-device-representing.utils";
import {buildLocalDateColumnOptions} from "../../../@shared/data-table/columns/local-date.column";

@UntilDestroy()
@Component({
  templateUrl: './list-sensor-device-datas.component.html',
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
      useClass: forwardRef(() => ListSensorDeviceDatasActionsContext),
    }
  ],
})
export class ListSensorDeviceDatasComponent implements OnInit {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly sensorDeviceRepresentingService: SensorDeviceRepresentingService,
  ) {
  }

  items: SensorDeviceDatasListModel[] = [];

  protected panelMenu: Readonly<MenuItem[]> = [
    {
      icon: 'pi pi-plus',
      [MenuTitleTranslation]: {key: 'buttons.create'},
      routerLink: '../add',
    },
  ];

  columns: ColumnSpec[] = [
    {
      header: prepareTranslatedValue('sensorDeviceDatas.fields.id'),
      ...buildNumericColumnOptions('id'),
    },
    {
      header: prepareTranslatedValue('sensorDeviceDatas.fields.sensorDevice'),
      globalFilter: 'sensorDevice.id',
      sortField: 'sensorDevice.id',
      ...buildSingleReferenceColumnOptions<ISensorDeviceReferenceModel>(
        'sensorDevice',
        sensorDevice => sensorDevice.id,
        sensorDevice => this.sensorDeviceRepresentingService.getLabel(sensorDevice),
        sensorDevice => ['../../sensor-devices/view', sensorDevice.id],
      ),
    },
    {
      header: prepareTranslatedValue('sensorDeviceDatas.fields.value'),
      ...buildNumericColumnOptions('value'),
    },
    {
      header: prepareTranslatedValue('sensorDeviceDatas.fields.recordDate'),
      ...buildLocalDateColumnOptions('recordDate'),
    },
    commonActionsColumnOptions,
  ];

  ngOnInit() {
    this.items = (this.activeRoute.snapshot.data['items'] as ApiResult<SensorDeviceDatasListModel[]>).value!;

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }
}

@Injectable()
class ListSensorDeviceDatasActionsContext implements CommonActionsContext<SensorDeviceDatasListModel> {
  constructor(
    private readonly sensorDeviceDatasClient: SensorDeviceDatasClient,
    private readonly representingService: SensorDeviceDataRepresentingService,
  ) {
  }

  getViewLinkCommands(item: SensorDeviceDatasListModel): any[] {
    return ['../view/', item.id];
  }

  getEditLinkCommands(item: SensorDeviceDatasListModel): any[] {
    return ['../edit/', item.id];
  }

  getItemNameForDelete(item: SensorDeviceDatasListModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  prepareDelete(item: SensorDeviceDatasListModel): Observable<unknown> {
    return this.sensorDeviceDatasClient.delete(item.id);
  }
}
