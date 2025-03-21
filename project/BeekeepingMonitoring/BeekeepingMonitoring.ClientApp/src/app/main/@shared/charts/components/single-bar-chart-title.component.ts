import {
  ChangeDetectionStrategy,
  Component,
  Input, OnInit,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslocoModule} from "@ngneat/transloco";
import {ButtonModule} from "primeng/button";
import {
  LoadablesTemplateUtilsModule
} from "../../../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {LoadableDisplayMediumModule} from "../../../../../@shared/loadables/status-display/loadable-display-medium";
import {CommonChartPresenterModule} from "../../../../../@shared/charts/common-chart-presenter";
import {Loadable} from "../../../../../@shared/loadables/loadable";
import {
  CommonVizDataDescriptor,
  CommonVizDatasetType,
  DEFAULT_DATASET, DEFAULT_SERIES_VALUE
} from "../../../../../@shared/charts/common-viz-data";
import {Widgets} from "../../../../../@core/app-api";
import {createConfigureChartFn} from "../../../../../@shared/charts/factories/shared";
import {configureBarChart} from "../../../../../@shared/charts/factories/bar.chart";
import {TransformDoubleLineChartPipe} from "../pipes/transform-double-line-chart.pipe";

import * as am5 from "@amcharts/amcharts5";
import {TransformSingleBarChartPipe} from "../pipes/transform-single-bar-chart.pipe";
import {CardModule} from "primeng/card";


@Component({
  selector: 'app-single-bar-chart',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    ButtonModule,
    LoadablesTemplateUtilsModule,
    LoadableDisplayMediumModule,
    CommonChartPresenterModule,
    TransformDoubleLineChartPipe,
    TransformSingleBarChartPipe,
    CardModule,
  ],
  template: `
    <ng-container [appLoadableAutoManage]="itemLoadable"/>
    <ng-container *loadableWhenLoaded="itemLoadable as items">
      @for (item of items; track item) {
          <p-card>
            <app-loadable-d-medium [loadable]="itemLoadable"/>
            @if (item.chartData) {
              <app-common-chart-presenter
                style="height: 300px"
                [data]="item!.chartData! | TransformSingleBarChartPipe"
                [dataDescriptor]="dataDescriptorSingleBarchart"
                [configureFn]="configureLineFn"></app-common-chart-presenter>
            }
          </p-card>
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
export class SingleBarChartTitleComponent implements OnInit{

  @Input()
  itemLoadable!: Loadable<Widgets[]>;
  @Input()
  displayNames?: string[];
  @Input()
  title?: string;

  configureLineFn!:any;
  ngOnInit() {

  this.configureLineFn = createConfigureChartFn(configureBarChart, {
      series: [
        {descriptorName: 'value', displayName: this.displayNames?this.displayNames![0]:"Unknown",  color: am5.color('#3399ff')},
      ],
    isLayered: true,
    label: this.title ? this.title : "Bar Chart"
  });


  }

  dataDescriptorSingleBarchart: CommonVizDataDescriptor = {
    [DEFAULT_DATASET]: {
      type: CommonVizDatasetType.Tabular,
      keyFields: ['data'],
      valueFields: {
        value: {[DEFAULT_SERIES_VALUE]: 'value'},
      },
    },
  };



  print(): void {
    window.print();
  }
}
