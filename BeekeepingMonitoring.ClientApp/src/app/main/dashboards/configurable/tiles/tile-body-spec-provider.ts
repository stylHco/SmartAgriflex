import {TilePresentSpec} from "../../@infrastructure/shared";
import {inject, Injectable} from "@angular/core";
import {PredefinedVisSpecProvider} from "./predefined-vis/provider";
import {TileModelData} from "../tile-model.data";
import {ConfDashboardTileType} from "../../../../@core/app-api";
import {changeableFromConstValue} from "../../../../@shared/utils/changeable";
import {of} from "rxjs";

export type TileBodySpec = Pick<TilePresentSpec, 'component' | 'data' | 'manageHeaderDescription'>;

@Injectable({
  providedIn: 'root',
})
export class TileBodySpecProvider {
  private readonly predefinedVisSpecProvider = inject(PredefinedVisSpecProvider);

  public provide(modelData: TileModelData): TileBodySpec {
    if (modelData.type === ConfDashboardTileType.PredefinedVisualization) {
      return this.predefinedVisSpecProvider.provide(modelData.predefinedVisOptions);
    }

    if (modelData.type === ConfDashboardTileType.DummyText) {
      return {
        component: async () => {
          const compImport = await import('../../@infrastructure/dummy-text-tile/dummy-text.component');

          return {
            componentType: compImport.DummyTextComponent,
          };
        },
        data: changeableFromConstValue(() => of(undefined)),
      };
    }

    throw 'Unreachable code';
  }
}
