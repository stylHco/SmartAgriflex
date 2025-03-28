import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Root } from "@amcharts/amcharts5";

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: '',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 400px; /* Ensure the container has sufficient height */
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private root: am5.Root | undefined;

  @Input() jsonData!: any[];

  ngAfterViewInit() {
    this.generateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['jsonData'] && !changes['jsonData'].isFirstChange()) {
      this.generateChart();
    }
  }

  ngOnDestroy() {
    this.disposeChart();
  }


  // The code here is inspired from am5 charts
  // the code can be found here https://www.amcharts.com/demos/line-graph/
  generateChart() {
    this.disposeChart();
    // Create root element
    this.root = am5.Root.new(this.elementRef.nativeElement);
    // Set themes
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    let customColors = am5.ColorSet.new(this.root, {
      colors: [
        am5.color(0x9FC5E8), // Blue
        am5.color(0x8FCE00), // Green
        am5.color(0x999999),  // grey
        am5.color(0xF1C232), // Yellow
        am5.color(0xFF0000), // Red
      ],
      step: 1
    });

    // Create chart
    let chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        colors: customColors // Assign custom colors directly to the chart
      })
    );

    // Set easing
    let easing = am5.ease.linear;
    chart.get("colors")!.set("step", 3);

    // Create axes
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        maxDeviation: 0.1,
        groupData: false,
        baseInterval: {
          timeUnit: "second",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 80,
          minorGridEnabled: true
        }),
        tooltip: am5.Tooltip.new(this.root, {})
      })
    );

    const createAxisAndSeries = (data: any[], sensorName: string, opposite: boolean) => {
      let yRenderer = am5xy.AxisRendererY.new(this.root!, {
        opposite: opposite
      });
      let yAxis;
      if (this.root instanceof Root) {
        yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(this.root, {
            maxDeviation: 1,
            renderer: yRenderer
          })
        );
      }

      if (chart.yAxes.indexOf(yAxis!) > 0) {
        yAxis!.set("syncWithAxis", chart.yAxes.getIndex(0) as am5xy.ValueAxis<typeof yRenderer>);
      }

      // Add series
      let series;
      if (this.root instanceof Root) {
        series = chart.series.push(
          am5xy.LineSeries.new(this.root, {
            xAxis: xAxis,
            yAxis: yAxis!,
            valueYField: "value",
            valueXField: "date",
            tooltip: am5.Tooltip.new(this.root, {
              pointerOrientation: "horizontal",
              labelText: "{valueY}"
            })
          })
        );
      }

      if (!series) {
        console.error('Series is undefined. Check the initialization.');
        return;
      }

      series.strokes.template.setAll({ strokeWidth: 1 });

      yRenderer.grid.template.set("strokeOpacity", 0.05);
      yRenderer.labels.template.set("fill", series.get("fill"));
      yRenderer.setAll({
        stroke: series.get("fill"),
        strokeOpacity: 1,
        opacity: 1
      });

      // Set up data processor to parse string dates
      if (this.root instanceof Root) {
        series.data.processor = am5.DataProcessor.new(this.root, {
          dateFormat: "yyyy-MM-dd HH:mm:ss",
          dateFields: ["date"]
        });
      }

      series.data.setAll(data);
    }

    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {
      xAxis: xAxis,
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Add scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
      orientation: "horizontal"
    }));

    // Create a series for each sensor in jsonData
    this.jsonData.forEach((sensorData, index) => {
      createAxisAndSeries(sensorData.data, sensorData.name, index % 2 !== 0);
    });

    // Make stuff animate on load
    chart.appear(1000, 100);
  }

  private disposeChart() {
    if (this.root) {
      this.root.dispose();
      this.root = undefined;
    }
  }
}
