import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TilesGridComponent} from "../../@infrastructure/tiles-grid/tiles-grid.component";
import {TileModel, TilePresentSpec} from "../../@infrastructure/shared";
import {DashboardTablesClient, PredefinedVisualizationType} from "../../../../@core/app-api";
import {PredefinedVisSpecProvider} from "../../configurable/tiles/predefined-vis/provider";
import {BehaviorSubject, map, Observable} from "rxjs";
import {PanelModule} from "primeng/panel";
import {SliderModule} from "primeng/slider";
import {FormsModule} from "@angular/forms";
import {Changeable, changeableFromTrigger} from "../../../../@shared/utils/changeable";
import {LoadableValueSource} from "../../../../@shared/loadables/loadable";
import {DashboardChartsService} from "../../../../@core/dashboard/dashboard-charts.service";
import {DEFAULT_DATASET} from "../../../../@shared/charts/common-viz-data";

const MaxLift = 10;

type SliderRange = [number, number];

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TilesGridComponent,
    PanelModule,
    SliderModule,
    FormsModule,
  ],
  templateUrl: './market-basket.component.html',
  styleUrls: ['./market-basket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketBasketComponent {
  private readonly predefinedVisSpecProvider = inject(PredefinedVisSpecProvider);
  private readonly chartsService = inject(DashboardChartsService);
  private readonly tablesClient = inject(DashboardTablesClient);

  protected liftRangeSubject = new BehaviorSubject<SliderRange>([0, MaxLift]);

  protected currentTiles: Readonly<TileModel<undefined>[]> = [
    {
      layoutItem: {id: '0', x: 0, y: 0, w: 6, h: 3},
      data: undefined,
    },
    {
      layoutItem: {id: '2', x: 0, y: 3, w: 3, h: 3, minW: 2, minH: 3},
      data: undefined,
    },
    {
      layoutItem: {id: '3', x: 3, y: 3, w: 3, h: 3, minW: 2, maxW: 3, minH: 2, maxH: 5},
      data: undefined,
    },
  ];

  private provideTileSpec(id: string, tileData: undefined): TilePresentSpec {
    switch (id) {
      case '0':
        return {
          ...this.predefinedVisSpecProvider.provide({type: PredefinedVisualizationType.AssociationRules}),

          data: changeableFromTrigger(
            this.liftRangeSubject as unknown as Observable<void>,
            () => {
              const range = this.liftRangeSubject.value;

              return () => this.tablesClient.associationRules()
                .pipe(
                  map(rules => {
                    return rules.filter(rule => testByRange(rule.lift, range));
                  }),
                );
            },
          ),

          actions: [],
        };

      case '2':
        return {
          ...this.predefinedVisSpecProvider.provide({type: PredefinedVisualizationType.RulesSupportConfidence}),

          data: this._chartData,
          actions: [],
        };

      case '3':
        return {
          ...this.predefinedVisSpecProvider.provide({type: PredefinedVisualizationType.RulesMatrix}),

          data: this._chartData,
          actions: [],
        };
    }

    throw 'Unreachable code';
  }

  private readonly _chartData: Changeable<LoadableValueSource<any>> = changeableFromTrigger(
    this.liftRangeSubject as unknown as Observable<void>,
    () => {
      const range = this.liftRangeSubject.value;

      return () => this.chartsService.getCommonVizData('rules-support-confidence')
        .pipe(
          map(container => {
            const filtered = container[DEFAULT_DATASET]
              .filter(rule => testByRange(rule['lift'], range));

            return {[DEFAULT_DATASET]: filtered};
          }),
        );
    },
  );

  protected readonly provideTileSpecBound = this.provideTileSpec.bind(this);
  protected readonly MaxLift = MaxLift;
}

function testByRange(value: number, range: SliderRange): boolean {
  return value >= range[0] && value <= range[1];
}
