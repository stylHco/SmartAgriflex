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
import {DevicesClient, DeviceDetailsModel} from "../../../@core/app-api";
import {DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {EmptyReplacerModule} from "../../../@shared/display-substitution/empty-replacer";
import {NullReplacerModule} from "../../../@shared/display-substitution/null-replacer";
import {DateTimeDisplayModule} from "../../../@shared/date-time/date-time-display";

@UntilDestroy()
@Component({
  templateUrl: './view-device.component.html',
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
    EmptyReplacerModule,
    NullReplacerModule,
    DateTimeDisplayModule,
  ],
})
export class ViewDeviceComponent implements OnInit {
  item!: DeviceDetailsModel;

  isDeleteDialogOpen = false;
  deleteMonitor = new SubscriptionsCounter();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly devicesClient: DevicesClient,
    private readonly router: Router,
    private readonly crudHelpers: CrudHelpersService,
    private readonly menuTranslator: MenuTranslatorService,
    protected readonly representingService: DeviceRepresentingService,
  ) {
  }

  protected panelMenu!: Readonly<MenuItem[]>;

  ngOnInit(): void {
    this.item = (this.activatedRoute.snapshot.data['item'] as ApiResult<DeviceDetailsModel>).value!;

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
    this.devicesClient.delete(this.item.id)
      .pipe(
        this.deleteMonitor.monitor({decrementOnlyOnError: true}),
        this.crudHelpers.handleDelete(this.representingService.getLabel(this.item).value),
        untilDestroyed(this),
      )
      .subscribe(() => this.router.navigate(['../../list'], {relativeTo: this.activatedRoute}));
  }
}

@Injectable()
export class ViewDeviceTitleProvider extends ResolvedApiItemTitleProvider<DeviceDetailsModel> {
  private readonly representingService = inject(DeviceRepresentingService);

  getItemTitle(item: DeviceDetailsModel): Changeable<string> {
    return this.representingService.getLabel(item);
  }

  protected override getTranslocoSuffix(): { key: string; scoped: boolean } | null {
    return {
      key: 'view.title_suffix',
      scoped: true,
    };
  }
}
