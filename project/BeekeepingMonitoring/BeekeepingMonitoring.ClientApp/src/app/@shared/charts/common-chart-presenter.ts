import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgModule,
  OnChanges,
  OnDestroy, SimpleChanges
} from '@angular/core';
import {applyCommonChartData, CommonChartConfigureFn, CommonChartWrapper} from "./common-chart.structures";
import {CommonVizDataContainer, CommonVizDataDescriptor} from "./common-viz-data";
import {ChartsRunnerService} from "./charts-runner.service";
import * as am5 from "@amcharts/amcharts5";
import {AmChartThemerService} from "./am-chart-themer";

@Component({
  selector: 'app-common-chart-presenter',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    ':host {display: block}',
  ],
})
export class CommonChartPresenterComponent implements OnChanges, AfterViewInit, OnDestroy {
  // Changes to this object will not be detected, replace instance instead
  @Input()
  dataDescriptor?: CommonVizDataDescriptor;

  @Input()
  configureFn?: CommonChartConfigureFn;

  // Changes to this object will not be detected, replace instance instead
  @Input()
  data?: CommonVizDataContainer;

  private hasViewInitted = false;
  private wrapper: CommonChartWrapper|null = null;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly chartsRunner: ChartsRunnerService,
    private readonly chartThemerService: AmChartThemerService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.hasViewInitted) return;

    if (changes.hasOwnProperty('dataDescriptor') || changes.hasOwnProperty('configureFn')) {
      this._rebuildChart();
    } else if (changes.hasOwnProperty('data')) {
      // _rebuildChart() already applies the data if the data is set, so no need to set it twice
      this._applyData();
    }
  }

  ngAfterViewInit(): void {
    this.hasViewInitted = true;

    this._rebuildChart();
  }

  ngOnDestroy(): void {
    this._destroyChart();
  }

  private _rebuildChart(): void {
    if (!this.hasViewInitted) return;

    this._destroyChart();

    if (!this.dataDescriptor) return;
    if (!this.configureFn) return;

    this.chartsRunner.do(() => {
      const root = am5.Root.new(this.elementRef.nativeElement);
      const themer = this.chartThemerService.applyThemer(root);

      this.wrapper = new CommonChartWrapper(this.dataDescriptor!, root, themer);
      this.configureFn!(this.wrapper);
    });

    this._applyDataIfSet();
  }

  private _applyDataIfSet(): void {
    if (!this.data) return;

    this._applyData();
  }

  private _applyData(): void {
    if (!this.wrapper) return;

    this.chartsRunner.do(() => {
      applyCommonChartData(this.wrapper!, this.data ?? {}); // TODO: populate empty datasets according to the descriptor
    });
  }

  private _destroyChart(): void {
    this.chartsRunner.do(() => {
      if (this.wrapper) {
        this.wrapper.root.dispose();
        this.wrapper = null;
      }
    });
  }
}

@NgModule({
  declarations: [CommonChartPresenterComponent],
  exports: [
    CommonChartPresenterComponent
  ]
})
export class CommonChartPresenterModule {
}
