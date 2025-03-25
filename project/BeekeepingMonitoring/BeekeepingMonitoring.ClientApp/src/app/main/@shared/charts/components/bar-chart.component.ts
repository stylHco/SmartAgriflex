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
import {TransformDoubleBarChartPipe} from "../pipes/transform-double-bar-chart.pipe";
import {UntilDestroy} from "@ngneat/until-destroy";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {BarChartInterface} from "./bar-chart-interface";

@UntilDestroy()
@Component({
  selector: 'app-bar-chart',
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

export class BarChartComponent implements OnInit, OnChanges {
  private readonly elementRef = inject(ElementRef);
  private root: am5.Root | undefined;

  @Input() data: BarChartInterface[] = [];


  private chart: am5xy.XYChart | undefined;

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    this.createChart();
    console.log(this.data)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateChartData();
    }
  }

  private colorTransformer(color: string): am5.Color {
    // return the default blue if the value is no rule otherwise return the actual color. If it is undefined return black
    return am5.color(color ? color == "No Rules"? "#648fd4" : color : "#000000");
  }

  private createChart(): void {
    // Create root element
    this.root = am5.Root.new(this.elementRef.nativeElement);

    // Set theme
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    // Create chart
    const chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 1
    }));

    // Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
    cursor.lineY.set("visible", false);

    // Create X-axis
    const xRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 30,
      minorGridEnabled: true
    });

    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15
    });

    xRenderer.grid.template.setAll({
      location: 1
    });

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(this.root, {
      maxDeviation: 0.3,
      categoryField: "label",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(this.root, {})
    }));

    // Create Y-axis
    const yRenderer = am5xy.AxisRendererY.new(this.root, {
      strokeOpacity: 0.1
    });

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      maxDeviation: 0.3,
      renderer: yRenderer
    }));

    // Create series
    const series = chart.series.push(am5xy.ColumnSeries.new(this.root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      sequencedInterpolation: true,
      categoryXField: "label",
      tooltip: am5.Tooltip.new(this.root, {
        labelText: "{valueY}"
      })
    }));

    // Set column appearance
    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0
    });

    // Modified color adapter to get color from data
    series.columns.template.adapters.add("fill", (fill, target) => {
      const dataItem = target.dataItem?.dataContext as { color?: string };
      return dataItem?.color ? this.colorTransformer(dataItem.color) : fill;
    });

    // Modified stroke adapter to match fill color
    series.columns.template.adapters.add("stroke", (stroke, target) => {
      const dataItem = target.dataItem?.dataContext as { color?: string };
      return dataItem?.color ? this.colorTransformer(dataItem.color) : stroke;
    });

    // Set data
    xAxis.data.setAll(this.data);
    series.data.setAll(this.data);

    // Add animations
    series.appear(1000);
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
