import {
  ChangeDetectionStrategy,
  Component,
  Input, OnInit,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslocoModule} from "@ngneat/transloco";
import {PanelModule} from "primeng/panel";
import {ButtonModule} from "primeng/button";
import {
  LoadablesTemplateUtilsModule
} from "../../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {LoadableDisplayMediumModule} from "../../../../@shared/loadables/status-display/loadable-display-medium";
import {CommonChartPresenterModule} from "../../../../@shared/charts/common-chart-presenter";
import {Loadable} from "../../../../@shared/loadables/loadable";
import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES_VALUE
} from "../../../../@shared/charts/common-viz-data";
import {createConfigureChartFn} from "../../../../@shared/charts/factories/shared";
import {configureBarChart} from "../../../../@shared/charts/factories/bar.chart";

import * as am5 from "@amcharts/amcharts5";
import {TransformDoubleBarChartPipe} from "../pipes/transform-double-bar-chart.pipe";
import {LoadableStateType} from "../../../../@shared/loadables/loadable-states";
import {UntilDestroy} from "@ngneat/until-destroy";
import {tap} from "rxjs";

@UntilDestroy()
@Component({
  selector: 'app-double-bar-no-card-chart',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    TranslocoModule,
    ButtonModule,
    LoadablesTemplateUtilsModule,
    LoadableDisplayMediumModule,
    CommonChartPresenterModule,
    TransformDoubleBarChartPipe,
  ],
  template: `
    <ng-container [appLoadableAutoManage]="itemLoadable"/>
    <ng-container *loadableWhenLoaded="itemLoadable as items">
      @for (item of items; track item) {
        <app-loadable-d-medium [loadable]="itemLoadable"/>
        @if (item) {
          <app-common-chart-presenter
            style="height: 300px"
            [data]="item!"
            [dataDescriptor]="dataDescriptorDoubleBarchart"
            [configureFn]="configureLineFn"></app-common-chart-presenter>
        }
      }
    </ng-container>
  `,

  styles: `
  :host ::ng-deep{
    .p-panel{
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .p-panel-content, .p-toggleable-content{
      height: 100%;
      align-items: center;
      justify-content: center;
    }
  }

  .divider {
    content: "";
    width: 100%;
    margin: 5px 0;
    border-bottom: 1px dashed;
    opacity: .2;
  }

  `,


  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class DoubleBarChartNoCardTitleComponent implements OnInit{

  @Input()
  itemLoadable!: Loadable<any[]>;
  @Input()
  displayNames?: string[];

  configureLineFn!:any;

  title!:string;
  ngOnInit() {

    this.itemLoadable.state$.pipe(
      tap(state => {
        if (state.type === LoadableStateType.Succeeded) {
          this.title = state.value[0].title!.toString();
          this.configureLineFn = createConfigureChartFn(configureBarChart, {
            series: [
              {descriptorName: 'value1', displayName: this.displayNames?this.displayNames![0]:"Unknown",  color: am5.color('#3399ff')},
              {descriptorName: 'value2', displayName: this.displayNames?this.displayNames![1]:"Unknown",  color: am5.color('#ff5233')},
            ],
            isLayered: true,
            label: this.title ? this.title : "Double Bar Chart"
          });
        } else if (state.type === LoadableStateType.Failed) {
          console.error('Data loading failed:', state.error);
        }
      })
    ).subscribe();
  }


  dataDescriptorDoubleBarchart: CommonVizDataDescriptor = {
    [DEFAULT_DATASET]: {
      type: CommonVizDatasetType.Tabular,
      keyFields: ['data'],
      valueFields: {
        value1: {[DEFAULT_SERIES_VALUE]: 'value1'},
        value2: {[DEFAULT_SERIES_VALUE]: 'value2'},
      },
    },
  };







  print(): void {
    window.print();
  }
}
