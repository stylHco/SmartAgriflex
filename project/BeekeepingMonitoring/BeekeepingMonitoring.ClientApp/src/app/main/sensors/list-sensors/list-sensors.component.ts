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
import {SensorsClient, SensorsListModel} from "../../../@core/app-api";
import {SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {prepareTranslatedValue} from "../../../@shared/dynamic-component/common/translated-value.component";
import {buildNumericColumnOptions} from "../../../@shared/data-table/columns/numeric.column";
import {buildStringColumnOptions} from "../../../@shared/data-table/columns/string.column";

@UntilDestroy()
@Component({
  templateUrl: './list-sensors.component.html',
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
      useClass: forwardRef(() => ListSensorsActionsContext),
    }
  ],
})
export class ListSensorsComponent implements OnInit {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly menuTranslator: MenuTranslatorService,
  ) {
  }

  items: SensorsListModel[] = [];

  protected panelMenu: Readonly<MenuItem[]> = [
    {
      icon: 'pi pi-plus',
      [MenuTitleTranslation]: {key: 'buttons.create'},
      routerLink: '../add',
    },
  ];

  columns: ColumnSpec[] = [
    {
      header: prepareTranslatedValue('sensors.fields.id'),
      ...buildNumericColumnOptions('id'),
    },
    {
      header: prepareTranslatedValue('sensors.fields.name'),
      ...buildStringColumnOptions('name'),
    },
    {
      header: prepareTranslatedValue('sensors.fields.description'),
      ...buildStringColumnOptions('description'),
    },
    commonActionsColumnOptions,
  ];

  ngOnInit() {
    this.items = (this.activeRoute.snapshot.data['items'] as ApiResult<SensorsListModel[]>).value!;

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }
}

@Injectable()
class ListSensorsActionsContext implements CommonActionsContext<SensorsListModel> {
  constructor(
    private readonly sensorsClient: SensorsClient,
    private readonly representingService: SensorRepresentingService,
  ) {
  }

  getViewLinkCommands(item: SensorsListModel): any[] {
    return ['../view/', item.id];
  }

  getEditLinkCommands(item: SensorsListModel): any[] {
    return ['../edit/', item.id];
  }

  getItemNameForDelete(item: SensorsListModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  prepareDelete(item: SensorsListModel): Observable<unknown> {
    return this.sensorsClient.delete(item.id);
  }
}
