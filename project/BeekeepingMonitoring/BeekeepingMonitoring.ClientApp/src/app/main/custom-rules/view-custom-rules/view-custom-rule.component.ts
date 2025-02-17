import {Component, inject, Injectable, OnInit} from '@angular/core';
import {ApiResult} from "../../../@shared/utils/api-result";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {CrudHelpersService} from "../../../@shared/utils/crud-helpers.service";
import {SubscriptionsCounter} from "../../../@shared/utils/subscriptions-counter";
import {ResolvedApiItemTitleProvider} from "../../../@shared/page-title/common-title-providers";
import {CommonModule} from "@angular/common";
import {TranslocoModule} from "@ngneat/transloco";
import {PanelModule} from "primeng/panel";
import {DetailsListModule} from "../../../@shared/details-list/details-list.module";
import {ButtonModule} from "primeng/button";
import {DeletionConfirmDialogModule} from "../../../@shared/deletion-confirm-dialog/deletion-confirm-dialog.module";
import {MenuItem} from "primeng/api";
import {PanelHeaderActionsComponent} from "../../../@shared/panel-header-actions/panel-header-actions.component";
import {DynamicMenuPipe} from "../../../@shared/dynamic-menu/dynamic-menu.pipe";
import {MenuTitleTranslation, MenuTranslatorService} from "../../../@shared/dynamic-menu/translated-menu";
import {Changeable} from "../../../@shared/utils/changeable";
import {
  CustomRulesDetailsModel,
  CustomRulesListModel, CustomRulesClient
} from "../../../@core/app-api";
import {SensorRepresentingComponent} from "../../../@core/sensors/sensor-representing.utils";
import {DeviceRepresentingComponent} from "../../../@core/devices/device-representing.utils";
import {EmptyReplacerModule} from "../../../@shared/display-substitution/empty-replacer";
import {NullReplacerModule} from "../../../@shared/display-substitution/null-replacer";
import {CustomRuleRepresentingService} from "../../../@core/custom-rules/custom-rule-representing.utils";

@UntilDestroy()
@Component({
  templateUrl: './view-custom-rule.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,

    PanelModule,
    PanelHeaderActionsComponent,
    DynamicMenuPipe,
    DetailsListModule,
    ButtonModule,
    DeletionConfirmDialogModule,
    SensorRepresentingComponent,
    DeviceRepresentingComponent,
    EmptyReplacerModule,
    NullReplacerModule,
  ],
})
export class ViewCustomRuleComponent implements OnInit {
  item!: CustomRulesDetailsModel;

  isDeleteDialogOpen = false;
  deleteMonitor = new SubscriptionsCounter();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly customRulesClient: CustomRulesClient,
    private readonly router: Router,
    private readonly crudHelpers: CrudHelpersService,
    private readonly menuTranslator: MenuTranslatorService,
    protected readonly representingService: CustomRuleRepresentingService,
  ) {
  }

  protected panelMenu!: Readonly<MenuItem[]>;

  ngOnInit(): void {
    this.item = (this.activatedRoute.snapshot.data['item'] as ApiResult<CustomRulesDetailsModel>).value!;

    this.panelMenu = [
      {
        icon: 'pi pi-pencil',
        [MenuTitleTranslation]: {key: 'buttons.edit'},
        routerLink: ['../../edit/', this.item.id],
      },
      {
        icon: 'pi pi-trash',
        [MenuTitleTranslation]: {key: 'buttons.delete'},
        command: () => this.isDeleteDialogOpen = true,
      },
      {separator: true},
      {
        icon: 'pi pi-plus',
        [MenuTitleTranslation]: {key: 'buttons.create'},
        routerLink: '../../add',
      },
      {
        icon: 'pi pi-list',
        [MenuTitleTranslation]: {key: 'buttons.listAll'},
        routerLink: '../../',
      },
    ];

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }

  delete() {
    this.customRulesClient.delete(this.item.id)
      .pipe(
        this.deleteMonitor.monitor({decrementOnlyOnError: true}),
        this.crudHelpers.handleDelete(this.representingService.getLabel(this.item).value),
        untilDestroyed(this),
      )
      .subscribe(() => this.router.navigate(['../../list'], {relativeTo: this.activatedRoute}));
  }
}

@Injectable()
export class ViewCustomRuleTitleProvider extends ResolvedApiItemTitleProvider<CustomRulesListModel> {
  private readonly representingService = inject(CustomRuleRepresentingService);

  getItemTitle(item: CustomRulesListModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  protected override getTranslocoSuffix(): { key: string; scoped: boolean } | null {
    return {
      key: 'view.title_suffix',
      scoped: true,
    };
  }
}
