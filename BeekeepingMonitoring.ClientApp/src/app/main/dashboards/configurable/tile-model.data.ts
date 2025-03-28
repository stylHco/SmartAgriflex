import {
  ConfDashboardTileType, IPredefinedVisualizationTileOptions
} from "../../../@core/app-api";

type DummyTextTileModelData = {
  type: ConfDashboardTileType.DummyText,
};

type PredefinedVisTileModelData = {
  type: ConfDashboardTileType.PredefinedVisualization,
  predefinedVisOptions: Readonly<IPredefinedVisualizationTileOptions>;
};

export type TileModelData = Readonly<
  DummyTextTileModelData |
  PredefinedVisTileModelData
>;
