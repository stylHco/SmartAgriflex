import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  ConfDashboardTileType,
  ConfigurableDashboardClient,
  ConfigurableDashboardDetailsModel, ConfigurableDashboardTileUpdateModel, PredefinedVisualizationTileOptions
} from "../../../@core/app-api";
import {ActivatedRoute} from "@angular/router";
import {Loadable} from "../../../@shared/loadables/loadable";
import {LoadablesTemplateUtilsModule} from "../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {CardModule} from "primeng/card";
import {ButtonModule} from "primeng/button";
import {DockModule} from "primeng/dock";
import {SubscriptionsCounter} from "../../../@shared/utils/subscriptions-counter";
import {LoadableDisplayMediumModule} from "../../../@shared/loadables/status-display/loadable-display-medium";
import {TilesGridComponent} from "../@infrastructure/tiles-grid/tiles-grid.component";
import {TileModel, TilePresentSpec} from "../@infrastructure/shared";
import {LoadableStateType} from "../../../@shared/loadables/loadable-states";
import {of, Subject, takeUntil} from "rxjs";
import {TileModelData} from "./tile-model.data";
import {TileBodySpecProvider} from "./tiles/tile-body-spec-provider";
import {DashboardNavigator} from "./dashboard-navigator";
import {DashboardSelectorComponent} from "./selector/dashboard-selector.component";
import {ConfigurableDashboardsRegistry} from "../../../@core/dashboard/configurable-dashboards-registry";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {PredefinedToastsService} from "../../../@shared/common-toasts/predefined-toasts.service";
import {CommonToastsService} from "../../../@shared/common-toasts/common-toasts.service";
import {ManageTileComponent, ManageTileState} from "./manage/manage-tile.component";
import {
  buildLossStateProvider,
  FormLossPreventionService,
  ILossStateProvider
} from "../../../@shared/form-loss-prevention/form-loss-prevention.service";
import {MessagesModule} from "primeng/messages";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CreateDashboardComponent} from "./manage-dashboard/create/create-dashboard.component";

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    CommonModule,
    LoadablesTemplateUtilsModule,
    CardModule,
    ButtonModule,
    DockModule,
    LoadableDisplayMediumModule,
    TilesGridComponent,
    DashboardSelectorComponent,
    ManageTileComponent,
    MessagesModule,
  ],
  templateUrl: './configurable-dashboard.component.html',
  styleUrls: ['./configurable-dashboard.component.scss'],
  providers: [
    ConfigurableDashboardsRegistry,
    DashboardNavigator,
    DialogService,
  ],
})
export class ConfigurableDashboardComponent implements OnInit {
  private readonly dashboardClient = inject(ConfigurableDashboardClient);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly contentSpecProvider = inject(TileBodySpecProvider);
  private readonly commonToasts = inject(CommonToastsService);
  private readonly predefinedToastsService = inject(PredefinedToastsService);
  private readonly formLossPreventionService = inject(FormLossPreventionService);
  private readonly dialogService = inject(DialogService);
  private readonly dashboardsRegistry = inject(ConfigurableDashboardsRegistry);
  private readonly dashboardNavigator = inject(DashboardNavigator);

  private readonly dashboardSwitchingSubject = new Subject<void>();

  readonly detailsLoadable = new Loadable<ConfigurableDashboardDetailsModel>();

  private nextLocalTileId = 0;

  // TODO: Cleanup/figure out key casts
  private readonly localToPersistentIdMap = new Map<number, number>();

  private dashboardId?: number;
  currentTiles: Readonly<TileModel<TileModelData>[]> = [];
  currentDashboardName: string = '';

  readonly savingMonitor = new SubscriptionsCounter();

  manageModeSelected: boolean = false;

  currentDashboardIsDirty: boolean = false;

  @ViewChild('manageTile')
  private manageTileComponent?: ManageTileComponent;

  private readonly _lossStateProvider: ILossStateProvider = buildLossStateProvider(
    this.activatedRoute.routeConfig,
    () => this.currentDashboardIsDirty,
  );

  private _createDashboardDialogRef?: DynamicDialogRef;

  ngOnInit(): void {
    this.formLossPreventionService.registerProvider(this._lossStateProvider);

    this.activatedRoute.params.subscribe(params => {
      this.dashboardSwitchingSubject.next();

      this.manageTileComponent?.forceDiscard();

      this.dashboardId = params['id'] ? +params['id'] : undefined;
      this.manageModeSelected = false;
      this.currentDashboardIsDirty = false;

      if (!this.dashboardId) {
        this.detailsLoadable.source = null;
        return;
      }

      const id = this.dashboardId;
      this.detailsLoadable.source = () => this.dashboardClient.get(id);
    });

    this.detailsLoadable.state$.subscribe(state => {
      if (state.type !== LoadableStateType.Succeeded) {
        this.localToPersistentIdMap.clear();

        this.currentDashboardName = '';
        this.currentTiles = [];

        return;
      }

      this.currentDashboardName = state.value.name;
      this.currentTiles = state.value.tiles
        .map(tile => ({
          layoutItem: {
            id: this.getNewTileId(tile.id),

            x: tile.x,
            y: tile.y,

            w: tile.width,
            h: tile.height,
          },
          data: {
            type: tile.type,

            predefinedVisOptions: tile.predefinedVisualizationOptions!,
          },
        }));
    })
  }

  private getNewTileId(persistentId?: number): string {
    let localId = this.nextLocalTileId++;

    if (persistentId) {
      this.localToPersistentIdMap.set(localId, persistentId);
    }

    return String(localId);
  }

  // TODO: Adjust this to match how selector works
  openCreateDashboard(): void {
    const dialogRef = this._createDashboardDialogRef = this.dialogService.open(CreateDashboardComponent, {
      ...CreateDashboardComponent.dialogConfig,
      header: 'Create dashboard',
    });

    dialogRef.onDestroy
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(() => this._createDashboardDialogRef === dialogRef && delete this._createDashboardDialogRef);

    dialogRef.onClose
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(newDashboardId => {
        if (newDashboardId) {
          // Reload the list
          this.dashboardsRegistry.dashboardsLoadable.loadFresh();

          // Open the new dashboard
          this.dashboardNavigator.navigateToDashboard(newDashboardId);
        }
      });
  }

  private provideTileSpec(localId: string, tileData: TileModelData): TilePresentSpec {
    return {
      ...this.contentSpecProvider.provide(tileData),

      actions: [
        {
          icon: 'pi pi-file-edit',
          title: of('Edit'),
          callback: () => {
            this.manageTileComponent!.show({
              localId: localId,
              data: tileData, // TODO: correct version?
            });
          },
        },
        {
          icon: 'pi pi-trash',
          title: of('Remove tile'),
          callback: () => {
            this.removeTile(localId);
          },
        },
      ],
    };
  }

  readonly provideTileSpecBound = this.provideTileSpec.bind(this);

  saveTiles(): void {
    const updateTiles = this.currentTiles
      .map(tile => {
        const persistentId = this.localToPersistentIdMap.get(Number(tile.layoutItem.id)) ?? null;

        return new ConfigurableDashboardTileUpdateModel({
          id: persistentId,
          tempId: persistentId ? null : tile.layoutItem.id,

          x: tile.layoutItem.x,
          y: tile.layoutItem.y,

          height: tile.layoutItem.h,
          width: tile.layoutItem.w,

          type: tile.data.type,

          ...getUpdateModelOptions(tile),
        });
      });

    this.dashboardClient.updateDashboardTiles(this.dashboardId!, updateTiles)
      .pipe(
        this.savingMonitor.monitor(),
        this.predefinedToastsService.internalErrorRxMonitor(),
        untilDestroyed(this),
        takeUntil(this.dashboardSwitchingSubject),
      )
      .subscribe(assignedIdsMap => {
        this.currentDashboardIsDirty = false;

        for (const localId in assignedIdsMap) {
          this.localToPersistentIdMap.set(Number(localId), assignedIdsMap[localId]);
        }

        this.commonToasts.showBasicSuccess({summary: 'Saved tiles'});
      });
  }

  protected onTileEdited(state: ManageTileState): void {
    if (state.localId) {
      this._updateTileData(state.localId, state.data);
    } else {
      this._addNewTile(state.data);
    }

    this.currentDashboardIsDirty = true;

    // Automatically enable manage mode, since the user is likely going to be dragging stuff around now
    this.manageModeSelected = true;
  }

  private _addNewTile(data: TileModelData): void {
    this.currentTiles = [
      ...this.currentTiles,
      {
        data,
        layoutItem: {
          id: this.getNewTileId(),

          x: -1,
          y: -1,

          w: 3,
          h: 3,
        },
      },
    ];
  }

  private _updateTileData(localId: string, newData: TileModelData): void {
    this.currentTiles = this.currentTiles
      .map(tile => {
        if (tile.layoutItem.id !== localId) return tile;

        return {
          layoutItem: tile.layoutItem,
          data: newData,
        }
      });
  }

  private removeTile(localId: string): void {
    // TODO: confirmation popup

    this.currentTiles = [...this.currentTiles.filter(tile => tile.layoutItem.id !== localId)];
    this.currentDashboardIsDirty = true;
  }
}

type UpdateModelOptions = Pick<
  ConfigurableDashboardTileUpdateModel,
  'predefinedVisualizationOptions'
>;

function getUpdateModelOptions(tile: TileModel<TileModelData>): UpdateModelOptions {
  const modelPart: UpdateModelOptions = {
    predefinedVisualizationOptions: null,
  };

  switch (tile.data.type) {
    case ConfDashboardTileType.PredefinedVisualization:
      modelPart.predefinedVisualizationOptions = new PredefinedVisualizationTileOptions(tile.data.predefinedVisOptions);
      break;
  }

  return modelPart;
}
