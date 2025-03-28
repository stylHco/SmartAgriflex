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
import {prepareTranslatedValue} from "../../../@shared/dynamic-component/common/translated-value.component";
import {buildNumericColumnOptions} from "../../../@shared/data-table/columns/numeric.column";
import {
  buildSingleReferenceColumnOptions,
} from "../../../@shared/data-table/columns/single-reference/single-reference.column";
import {SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {buildStringColumnOptions} from "../../../@shared/data-table/columns/string.column";
import {CustomRulesClient, CustomRulesListModel, ISensorReferenceModel} from "../../../@core/app-api";
import {CustomRuleRepresentingService} from "../../../@core/custom-rules/custom-rule-representing.utils";

@UntilDestroy()
@Component({
  templateUrl: './list-custom-rules.component.html',
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
      useClass: forwardRef(() => ListCustomRulesActionsContext),
    }
  ],
})
export class ListCustomRulesComponent implements OnInit {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly sensorRepresentingService: SensorRepresentingService,
  ) {
  }

  items: CustomRulesListModel[] = [];

  protected panelMenu: Readonly<MenuItem[]> = [
    {
      icon: 'pi pi-plus',
      [MenuTitleTranslation]: {key: 'buttons.create'},
      routerLink: '../add',
    },
  ];

  columns: ColumnSpec[] = [
    {
      header: prepareTranslatedValue('customRules.fields.id'),
      ...buildNumericColumnOptions('id'),
    },
    {
      header: prepareTranslatedValue('customRules.fields.sensor'),
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
      header: prepareTranslatedValue('customRules.fields.min'),
      ...buildNumericColumnOptions('min'),
    },
    {
      header: prepareTranslatedValue('customRules.fields.max'),
      ...buildNumericColumnOptions('max'),
    },
    {
      header: prepareTranslatedValue('customRules.fields.program_directive'),
      ...buildStringColumnOptions('programDirective'),
    },
    {
      header: prepareTranslatedValue('customRules.fields.rule_text'),
      ...buildStringColumnOptions('ruleText'),
    },
    commonActionsColumnOptions,
  ];

  ngOnInit() {
    this.items = (this.activeRoute.snapshot.data['items'] as ApiResult<CustomRulesListModel[]>).value!;

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }
}

@Injectable()
class ListCustomRulesActionsContext implements CommonActionsContext<CustomRulesListModel> {
  constructor(
    private readonly customRulesClient: CustomRulesClient,
    private readonly representingService: CustomRuleRepresentingService,
  ) {
  }

  getViewLinkCommands(item: CustomRulesListModel): any[] {
    return ['../view/', item.id];
  }

  getEditLinkCommands(item: CustomRulesListModel): any[] {
    return ['../edit/', item.id];
  }

  getItemNameForDelete(item: CustomRulesListModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  prepareDelete(item: CustomRulesListModel): Observable<unknown> {
    return this.customRulesClient.delete(item.id);
  }
}
