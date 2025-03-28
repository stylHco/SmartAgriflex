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
import {DevicesClient, DevicesListModel} from "../../../@core/app-api";
import {DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {prepareTranslatedValue} from "../../../@shared/dynamic-component/common/translated-value.component";
import {buildNumericColumnOptions} from "../../../@shared/data-table/columns/numeric.column";
import {buildStringColumnOptions} from "../../../@shared/data-table/columns/string.column";
import {buildDateTimeColumnOptions} from "../../../@shared/data-table/columns/datetime.column";

@UntilDestroy()
@Component({
  templateUrl: './list-devices.component.html',
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
      useClass: forwardRef(() => ListDevicesActionsContext),
    }
  ],
})
export class ListDevicesComponent implements OnInit {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly menuTranslator: MenuTranslatorService,
  ) {
  }

  items: DevicesListModel[] = [];

  protected panelMenu: Readonly<MenuItem[]> = [
    {
      icon: 'pi pi-plus',
      [MenuTitleTranslation]: {key: 'buttons.create'},
      routerLink: '../add',
    },
  ];

  columns: ColumnSpec[] = [
    {
      header: prepareTranslatedValue('devices.fields.id'),
      ...buildNumericColumnOptions('id'),
    },
    {
      header: prepareTranslatedValue('devices.fields.name'),
      ...buildStringColumnOptions('name'),
    },
    {
      header: prepareTranslatedValue('devices.fields.nickname'),
      ...buildStringColumnOptions('nickname'),
    },
    {
      header: prepareTranslatedValue('devices.fields.description'),
      ...buildStringColumnOptions('description'),
    },
    {
      header: prepareTranslatedValue('devices.fields.model'),
      ...buildStringColumnOptions('model'),
    },
    {
      header: prepareTranslatedValue('devices.fields.latitude'),
      ...buildNumericColumnOptions('latitude'),
    },
    {
      header: prepareTranslatedValue('devices.fields.longitude'),
      ...buildNumericColumnOptions('longitude'),
    },
    {
      header: prepareTranslatedValue('devices.fields.installedDate'),
      ...buildDateTimeColumnOptions('installedDate'),
    },
    {
      header: prepareTranslatedValue('devices.fields.uid'),
      ...buildStringColumnOptions('uid'),
    },
    commonActionsColumnOptions,
  ];

  ngOnInit() {
    this.items = (this.activeRoute.snapshot.data['items'] as ApiResult<DevicesListModel[]>).value!;

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }
}

@Injectable()
class ListDevicesActionsContext implements CommonActionsContext<DevicesListModel> {
  constructor(
    private readonly devicesClient: DevicesClient,
    private readonly representingService: DeviceRepresentingService,
  ) {
  }

  getViewLinkCommands(item: DevicesListModel): any[] {
    return ['../view/', item.id];
  }

  getEditLinkCommands(item: DevicesListModel): any[] {
    return ['../edit/', item.id];
  }

  getItemNameForDelete(item: DevicesListModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  prepareDelete(item: DevicesListModel): Observable<unknown> {
    return this.devicesClient.delete(item.id);
  }
}
