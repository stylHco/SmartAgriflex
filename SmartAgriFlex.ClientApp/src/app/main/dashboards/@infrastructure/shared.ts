import {LoadableValueSource} from "../../../@shared/loadables/loadable";
import {DynamicComponentBlueprint} from "../../../@shared/dynamic-component/dynamic-component.blueprint";
import {Changeable} from "../../../@shared/utils/changeable";
import {KtdGridLayoutItem} from "@katoid/angular-grid-layout";
import {Observable} from "rxjs";

export const TILE_CONTENT_DATA_INPUT = '__TILE_CONTENT_DATA';
export const TILE_MODEL_DATA_INPUT = '__TILE_MODEL_DATA';

export type TileContentInputs = {
  [TILE_CONTENT_DATA_INPUT]: unknown,
};

export type TileManageHeaderInputs = {
  [TILE_MODEL_DATA_INPUT]: unknown,
};

export type TilePresentSpec = Readonly<{
  component: LoadableValueSource<DynamicComponentBlueprint<any>>;
  data: Changeable<LoadableValueSource<any>>;

  manageHeaderDescription?: DynamicComponentBlueprint<any, TileManageHeaderInputs>;
  actions: Readonly<TileAction[]>;

  // When we add filters (or also other dash-exposed params?) we
  // will probably want to put their definitions here as well.
}>;

export type TileAction = Readonly<{
  icon: string,
  title: Observable<string>,
  callback: VoidFunction,
}>;

export type TileModel<T> = Readonly<{
  layoutItem: Readonly<KtdGridLayoutItem>,
  data: T;
}>;


