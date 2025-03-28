import {buildEnumTranslationSpec} from "../../@transloco/translated-enum";
import {ConfDashboardTileType, PredefinedVisualizationType} from "../app-api";

export const TileTypeSpec = buildEnumTranslationSpec(
  ConfDashboardTileType, 'enums.ConfDashboardTileType',
);

export const PredefinedVisTypeSpec = buildEnumTranslationSpec(
  PredefinedVisualizationType, 'enums.PredefinedVisualizationType',
);
