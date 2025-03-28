import {
  DashboardTablesClient,
  IPredefinedVisualizationTileOptions,
  PredefinedVisualizationType
} from "../../../../../@core/app-api";
import {changeableFromConstValue} from "../../../../../@shared/utils/changeable";
import {CommonVizDataDescriptor} from "../../../../../@shared/charts/common-viz-data";
import {DynamicComponentBlueprint} from "../../../../../@shared/dynamic-component/dynamic-component.blueprint";
import {
  CONFIGURE_FN_INPUT,
  DESCRIPTOR_INPUT,
  PredefinedChartComponentInputs
} from "../../../@infrastructure/predefined-chart-tile/predefined-chart.inputs";
import {CommonChartConfigureFn} from "../../../../../@shared/charts/common-chart.structures";
import {LoadableValueSource} from "../../../../../@shared/loadables/loadable";
import {TileManageHeaderInputs} from "../../../@infrastructure/shared";
import {Injectable, Type} from "@angular/core";
import {DashboardChartsService} from "../../../../../@core/dashboard/dashboard-charts.service";
import {
  CHART_TYPE_INPUT,
  PredefinedVisManageHeaderComponent,
  PredefinedVisManageHeaderInputs
} from "./predefined-vis-manage-header.component";
import {TileBodySpec} from "../tile-body-spec-provider";
import {
  SimpleTableComponentInputs,
  TABLE_BLUEPRINT_INPUT
} from "../../../@infrastructure/simple-table-tile/simple-table.inputs";
import {type AbstractTableContentComponent} from "./abstract-table-content.component";

@Injectable({
  providedIn: 'root',
})
export class PredefinedVisSpecProvider {
  constructor(
    private readonly chartsService: DashboardChartsService,
    private readonly tablesClient: DashboardTablesClient,
  ) {
  }

  // TODO: better args (+ name?)
  public provide(options: Readonly<IPredefinedVisualizationTileOptions>): TileBodySpec {
    switch (options.type) {
      case PredefinedVisualizationType.BasicPie:
        return setupChartTileSpec(
          () => import('./content/basic-pie'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.BasicDonut:
        return setupChartTileSpec(
          () => import('./content/basic-donut'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.BasicBar:
        return setupChartTileSpec(
          () => import('./content/basic-bar'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.HorizontalBar:
        return setupChartTileSpec(
          () => import('./content/horizontal-bar'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.BasicHeatMap:
        return setupChartTileSpec(
          () => import('./content/basic-heat-map'),
          () => this.chartsService.getCommonVizData('sales-by-pack-type-area'),
        );

      case PredefinedVisualizationType.SemiPie:
        return setupChartTileSpec(
          () => import('./content/semi-pie'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.BasicRadar:
        return setupChartTileSpec(
          () => import('./content/basic-radar'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.BasicLine:
        return setupChartTileSpec(
          () => import('./content/basic-line'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.DualLine:
        return setupChartTileSpec(
          () => import('./content/dual-line'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.NestedDonut:
        return setupChartTileSpec(
          () => import('./content/nested-donut'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.MultiBar:
        return setupChartTileSpec(
          () => import('./content/multi-bar'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.LayeredBar:
        return setupChartTileSpec(
          () => import('./content/layered-bar'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.BasicBoxplot:
        return setupChartTileSpec(
          () => import('./content/basic-boxplot'),
          () => this.chartsService.getCommonVizData('sales-by-year-for-boxplot'),
        );

      case PredefinedVisualizationType.BasicTimeLine:
        return setupChartTileSpec(
          () => import('./content/basic-time-line'),
          () => this.chartsService.getCommonVizData('sales-by-date'),
        );

      case PredefinedVisualizationType.BasicCyprusMap:
        return setupChartTileSpec(
          () => import('./content/basic-cyprus-map'),
          () => this.chartsService.getCommonVizData('sales-by-district'),
        );

      case PredefinedVisualizationType.BasicBullet:
        return setupChartTileSpec(
          () => import('./content/basic-bullet'),
          () => this.chartsService.getCommonVizData('dummy-target-completion'),
        );

      case PredefinedVisualizationType.BasicPareto:
        return setupChartTileSpec(
          () => import('./content/basic-pareto'),
          () => this.chartsService.getCommonVizData('sales-volume-by-outlet-type'),
        );

      case PredefinedVisualizationType.StackedBar:
        return setupChartTileSpec(
          () => import('./content/stacked-bar'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.ComboLineBar:
        return setupChartTileSpec(
          () => import('./content/combo-line-bar'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.ComboLineBarRotated:
        return setupChartTileSpec(
          () => import('./content/combo-line-bar-rotated'),
          () => this.chartsService.getCommonVizData('sales-by-year'),
        );

      case PredefinedVisualizationType.HorizontalBoxplot:
        return setupChartTileSpec(
          () => import('./content/horizontal-boxplot'),
          () => this.chartsService.getCommonVizData('sales-by-year-for-boxplot'),
        );

      case PredefinedVisualizationType.ComboLineBox:
        return setupChartTileSpec(
          () => import('./content/combo-line-box'),
          () => this.chartsService.getCommonVizData('sales-by-year-for-boxplot'),
        );

      case PredefinedVisualizationType.BasicSunburstChart:
        return setupChartTileSpec(
          () => import('./content/basic-sunburst-chart'),
          () => this.chartsService.getCommonVizData('calendar-sales-hierarchical'),
        );

      case PredefinedVisualizationType.BasicTreeMap:
        return setupChartTileSpec(
          () => import('./content/basic-tree-map'),
          () => this.chartsService.getCommonVizData('calendar-sales-hierarchical'),
        );

      case PredefinedVisualizationType.BasicPartitionChart:
        return setupChartTileSpec(
          () => import('./content/basic-partition-chart'),
          () => this.chartsService.getCommonVizData('calendar-sales-hierarchical'),
        );

      case PredefinedVisualizationType.RulesSupportConfidence:
        return setupChartTileSpec(
          () => import('./content/rules-confidence'),
          () => this.chartsService.getCommonVizData('rules-support-confidence'),
        );

      case PredefinedVisualizationType.RulesSupportConfidenceLift:
        return setupChartTileSpec(
          () => import('./content/rules-confidence-lift'),
          () => this.chartsService.getCommonVizData('rules-support-confidence'),
        );

      case PredefinedVisualizationType.RulesMatrix:
        return setupChartTileSpec(
          () => import('./content/rules-matrix'),
          () => this.chartsService.getCommonVizData('rules-support-confidence'),
        );

      case PredefinedVisualizationType.AssociationRules:
        return setupTableTileSpec(
          () => import('./content/association-rules'),
          () => this.tablesClient.associationRules(),
        );
    }

    throw 'PredefinedVisSpecProvider - unreachable code';

    function setupChartTileSpec(
      importFactory: () => Promise<CommonChartSource>,
      dataSource: LoadableValueSource<unknown>,
    ): TileBodySpec {
      return {
        component: prepareCommonChartSource(importFactory),

        ...setupSharedSpecOptions(dataSource),
      };
    }

    function setupTableTileSpec<TContent>(
      importFactory: () => Promise<SimpleTableSource<TContent>>,
      dataSource: LoadableValueSource<TContent>,
    ): TileBodySpec {
      return {
        component: prepareSimpleTableSource(importFactory),

        ...setupSharedSpecOptions(dataSource),
      };
    }

    function setupSharedSpecOptions(
      dataSource: LoadableValueSource<unknown>,
    ): Pick<TileBodySpec, 'data' | 'manageHeaderDescription'> {
      return {
        data: changeableFromConstValue(dataSource),

        manageHeaderDescription: {
          componentType: PredefinedVisManageHeaderComponent,
          initSetInputs: {
            [CHART_TYPE_INPUT]: options.type,
          } satisfies PredefinedVisManageHeaderInputs as Partial<TileManageHeaderInputs>,
        },
      };
    }
  }
}

type CommonChartSource = {
  configureFn: CommonChartConfigureFn,
  dataDescriptor: CommonVizDataDescriptor,
};

type SimpleTableSource<TContent> = {
  default: Type<AbstractTableContentComponent<TContent>>,
};

function prepareCommonChartSource(
  importFactory: () => Promise<CommonChartSource>,
): LoadableValueSource<DynamicComponentBlueprint<any, PredefinedChartComponentInputs>> {
  return async () => {
    // Start loading at the same time
    const chartImportPromise = importFactory();

    const componentImport = await import('../../../@infrastructure/predefined-chart-tile/predefined-chart.component');
    const chartImport = await chartImportPromise;

    return {
      componentType: componentImport.PredefinedChartComponent,
      initSetInputs: {
        [CONFIGURE_FN_INPUT]: chartImport.configureFn,
        [DESCRIPTOR_INPUT]: chartImport.dataDescriptor,
      },
    };
  };
}


function prepareSimpleTableSource(
  importFactory: () => Promise<SimpleTableSource<unknown>>,
): LoadableValueSource<DynamicComponentBlueprint<any, SimpleTableComponentInputs>> {
  return async () => {
    // Start loading at the same time
    const tableImportPromise = importFactory();

    const wrapperImport = await import('../../../@infrastructure/simple-table-tile/simple-table.component');
    const table = await tableImportPromise;

    return {
      componentType: wrapperImport.SimpleTableComponent,
      initSetInputs: {
        [TABLE_BLUEPRINT_INPUT]: {
          componentType: table.default,
        },
      },
    };
  };
}
