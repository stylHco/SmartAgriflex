import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
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

import * as am5 from "@amcharts/amcharts5";
import {UntilDestroy} from "@ngneat/until-destroy";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {DoubleLineChartDateInterface} from "./double-line-chart-interface";

@UntilDestroy()
@Component({
  selector: 'app-double-line-chart',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    TranslocoModule,
    ButtonModule,
    LoadablesTemplateUtilsModule,
    LoadableDisplayMediumModule,
    CommonChartPresenterModule,
  ],
  template: `
  `,

  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 400px; /* Ensure the container has sufficient height */
      }
    `
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoubleLineChartComponent implements OnInit, OnChanges {
  private readonly elementRef = inject(ElementRef);
  private root: am5.Root | undefined;

  @Input() data: DoubleLineChartDateInterface[] = [];

  @Input() line1Label: string = "line1";
  @Input() line2Label: string = "line2";


  private chart: am5xy.XYChart | undefined;

  constructor(private el: ElementRef) {
  }

  ngOnInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateChartData();
    }
  }


  // The code here is inspired from am5 charts
  // the code can be found here https://www.amcharts.com/demos/highlighting-line-chart-series-on-legend-hover/
  createChart() {

    this.root = am5.Root.new(this.elementRef.nativeElement);
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    const chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        layout: this.root.verticalLayout
      })
    );

    // ======================
    // 3. Axes Configuration
    // ======================
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: "label",
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 30,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9
        })
      })
    );
    xAxis.data.setAll(this.data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {})
      })
    );

    const createSeries = (field: string, name: string, dashed = false) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(this.root!, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          categoryXField: "label",
          tooltip: am5.Tooltip.new(this.root!, {
            labelText: "{name}: {valueY}"
          }),
        })
      );

      series.strokes.template.setAll({
        strokeWidth: 2,
        strokeDasharray: dashed ? [2, 2] : undefined
      });

      series.data.setAll(this.data);
      return series;
    };

    const series1 = createSeries("line1", this.line1Label || "Series 1");
    const series2 = createSeries("line2", this.line2Label || "Series 2", true);

    chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
    chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
      orientation: "horizontal"
    }));

    // ======================
    // 6. Legend
    // ======================
    const legend = chart.children.push(
      am5.Legend.new(this.root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 20
      })
    );
    legend.data.setAll(chart.series.values);


    chart.appear(1000, 100);

  }


  private updateChartData() {
    if (this.chart) {
      const series = this.chart.series.getIndex(0);
      series!.data.setAll(this.data);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
