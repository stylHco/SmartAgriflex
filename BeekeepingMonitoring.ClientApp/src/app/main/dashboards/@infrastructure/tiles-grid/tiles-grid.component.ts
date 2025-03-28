import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TILE_MODEL_DATA_INPUT, TileManageHeaderInputs, TileModel, TilePresentSpec} from "../shared";
import {BreakpointsService, ViewpointBreakpoint} from "../../../../@theme/breakpoints";
import {KtdGridLayout, KtdGridModule} from "@katoid/angular-grid-layout";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {MessagesModule} from "primeng/messages";
import {SharedModule} from "primeng/api";
import {PanelModule} from "primeng/panel";
import {ButtonModule} from "primeng/button";
import {TileContentComponent} from "./tile-content.component";
import {trackKvpByKey} from "../../../../@shared/utils/collection.helpers";
import {
  DynamicComponentOutletDirective
} from "../../../../@shared/dynamic-component/dynamic-component-outlet.directive";
import {NgxResizeObserverModule} from "ngx-resize-observer";

type ContentRuntimeData<TTileModel extends TileModel<any>> = {
  data: TTileModel['data'],
  presentSpec: TilePresentSpec;

  // TODO: actual loadables (maybe instead of storing the spec?)
};

type PresentSpecProvider<TTileModel extends TileModel<any>> = (id: string, data: TTileModel['data']) => TilePresentSpec;

/**
 * Return true to reuse the existing TilePresentSpec
 */
export type TileDataComparator<TTileModel extends TileModel<any>>
  = (oldData: TTileModel['data'], newData: TTileModel['data']) => boolean;

const instanceReferenceTileDataComparator: TileDataComparator<any> = (oldData, newData) => oldData === newData;

/**
 * Below this breakpoint, management will be disabled and grid will collapse to a single column
 */
const minBreakpoint = ViewpointBreakpoint.Medium;

@UntilDestroy()
@Component({
  selector: 'app-dash-tiles-grid',
  standalone: true,
  imports: [
    CommonModule,
    MessagesModule,
    SharedModule,
    KtdGridModule,
    PanelModule,
    ButtonModule,
    TileContentComponent,
    DynamicComponentOutletDirective,
    NgxResizeObserverModule,
  ],
  templateUrl: './tiles-grid.component.html',
  styleUrls: ['./tiles-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TilesGridComponent<TTileModel extends TileModel<any>> implements OnInit, DoCheck {
  readonly trackKvp = trackKvpByKey;

  private readonly breakpointsService = inject(BreakpointsService);

  readonly _contentMap = new Map<string, ContentRuntimeData<TTileModel>>();

  @Input()
  public set tileModels(value: Readonly<TTileModel[]>) {
    this._tileModels = value;

    this._contentDirty = true;
    this._rebuildLayoutFromModels();
  }

  @Output()
  public readonly tileModelsChange = new EventEmitter<Readonly<TTileModel[]>>();

  @Input()
  public set presentSpecProvider(value: PresentSpecProvider<TTileModel>) {
    this._presentSpecProvider = value;
    this._contentDirty = true;
  }

  @Input()
  public set tileDataComparator(value: TileDataComparator<TTileModel> | undefined | null) {
    this._tileDataComparator = value ?? instanceReferenceTileDataComparator;
    this._contentDirty = true;
  }

  private _tileModels: Readonly<TTileModel[]> = [];
  private _presentSpecProvider?: PresentSpecProvider<TTileModel>;
  private _tileDataComparator: TileDataComparator<TTileModel> = instanceReferenceTileDataComparator;

  private _contentDirty = false;

  /**
   * If true, manage mode might still not become active, in case the viewport is too small.
   */
  @Input()
  isManageModeSelected: boolean = false;

  viewportLargeEnough: boolean = true;

  private _fullLayout: KtdGridLayout = [];
  private _smallViewportLayout: KtdGridLayout = [];

  ///////////////////////
  /// Lifecycle hooks ///
  ///////////////////////

  ngOnInit(): void {
    this.breakpointsService.currentlyMatches$(minBreakpoint)
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(value => this.viewportLargeEnough = value);
  }

  ngDoCheck(): void {
    if (this._contentDirty) {
      this._contentDirty = false;
      this._updateContent();
    }
  }

  ///////////////////
  /// Grid layout ///
  ///////////////////

  get activeLayout(): KtdGridLayout {
    return this.viewportLargeEnough ? this._fullLayout : this._smallViewportLayout;
  }

  private _rebuildLayoutFromModels(): void {
    this._fullLayout = this._tileModels
      .map(model => model.layoutItem);

    this._rebuildSmallViewportLayout();
  }

  onLayoutUpdated($event: KtdGridLayout): void {
    const tileDataById: { [id: string]: TTileModel['data'] } = {};
    for (const tileModel of this._tileModels) {
      tileDataById[tileModel.layoutItem.id] = tileModel.data;
    }

    const newModels = $event
      .map(layoutItem => {
        // Note: cannot just check `!data` as some simple/demo tiles might be passing `undefined`
        // as their model data and then we get incorrect errors reported.

        if (!(layoutItem.id in tileDataById)) {
          console.error(
            'Cannot find data for tile while reconstructing models after layout change - this will cause data corruption! Id: ',
            layoutItem.id,
          );
        }

        const data = tileDataById[layoutItem.id];

        // TODO: get rid of type assertion
        return {layoutItem, data} as TTileModel;
      });

    this._tileModels = newModels;
    this.tileModelsChange.emit(newModels);

    this._fullLayout = $event;
    this._rebuildSmallViewportLayout();

    // No need to (schedule) rebuild of runtime content here as
    // the model data is guaranteed to not have changed.
  }

  private _rebuildSmallViewportLayout(): void {
    // This clones both the array and the items within
    const layoutCopy = this._fullLayout
      .map(item => ({...item}));

    layoutCopy.sort((a, b) => {
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;

      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;

      return 0;
    });

    let currentY = 0;
    for (const item of layoutCopy) {
      item.y = currentY;
      item.x = 0;

      item.h = 1;
      item.w = 1;

      currentY++;
    }

    this._smallViewportLayout = layoutCopy;
  }

  ///////////////
  /// Content ///
  ///////////////

  private _updateContent(): void {
    const presentIds = new Set<string>();

    if (this._presentSpecProvider) {
      for (const tileModel of this._tileModels) {
        presentIds.add(tileModel.layoutItem.id);
        this._updateContentSpecificTile(tileModel);
      }
    }

    // Remove all non-present IDs

    const idsToRemove = [];

    for (const id of this._contentMap.keys()) {
      if (!presentIds.has(id)) {
        idsToRemove.push(id);
      }
    }

    for (const id of idsToRemove) {
      this._contentMap.delete(id);
    }
  }

  // Assumes this._presentSpecProvider is set
  private _updateContentSpecificTile(tileModel: TTileModel): void {
    const tileId = tileModel.layoutItem.id;
    const tileData = tileModel.data;

    const runtimeData = this._contentMap.get(tileId);

    // New tile
    if (!runtimeData) {
      this._contentMap.set(tileId, {
        data: tileData,
        presentSpec: this._presentSpecProvider!(tileId, tileData),
      });

      return;
    }

    // Updating an existing tile
    const reuseCurrentSpec = this._tileDataComparator(runtimeData.data, tileData);

    if (!reuseCurrentSpec) {
      runtimeData.presentSpec = this._presentSpecProvider!(tileId, tileData);
    }
  }

  ///////////////////
  /// Manage mode ///
  ///////////////////

  @HostBinding('class.manage-mode')
  get isManageModeActive(): boolean {
    return this.isManageModeSelected && this.viewportLargeEnough;
  }

  //////////////////////
  /// Template utils ///
  //////////////////////

  getManageHeaderDescriptionInputs(runtimeData: ContentRuntimeData<any>): TileManageHeaderInputs {
    return {
      [TILE_MODEL_DATA_INPUT]: runtimeData.data,
    };
  }
}
