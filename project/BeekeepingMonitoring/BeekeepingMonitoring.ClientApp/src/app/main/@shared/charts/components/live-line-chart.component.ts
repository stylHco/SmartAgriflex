import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
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
  selector: 'app-live-line-chart',
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
export class LiveLineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  private root: am5.Root | undefined;
  private seriesMap: Map<string, am5xy.LineSeries> = new Map();

  @Input() jsonData!: any[];

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.generateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['jsonData'] && !changes['jsonData'].isFirstChange()) {
      this.updateSeriesData();
    }
  }

  ngOnDestroy() {
    this.disposeChart();
  }

  generateChart() {
    // Create root element if not already created
    if (!this.root) {
      this.root = am5.Root.new(this.elementRef.nativeElement);
      this.root.setThemes([am5themes_Animated.new(this.root)]);
    }
    console.log(this.jsonData)

    let chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        colors: am5.ColorSet.new(this.root, {
          step: 1
        })
      })
    );

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

    // Create series for each sensor in jsonData
    this.jsonData.forEach((sensorData, index) => {
      let opposite = index % 2 !== 0;
      let yRenderer = am5xy.AxisRendererY.new(this.root!, {
        opposite: opposite
      });
      let yAxis:any;
      if (this.root instanceof Root) {
        yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(this.root, {
            maxDeviation: 1,
            renderer: yRenderer
          })
        );
      }

      if (chart.yAxes.indexOf(yAxis) > 0) {
        yAxis.set("syncWithAxis", chart.yAxes.getIndex(0) as am5xy.ValueAxis<typeof yRenderer>);
      }

      let series:any;
      if (this.root instanceof Root) {
        series = chart.series.push(
          am5xy.LineSeries.new(this.root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            valueXField: "date",
            tooltip: am5.Tooltip.new(this.root, {
              pointerOrientation: "horizontal",
              labelText: "{valueY}"
            })
          })
        );
      }

      series.strokes.template.setAll({ strokeWidth: 1 });

      yRenderer.grid.template.set("strokeOpacity", 0.05);
      yRenderer.labels.template.set("fill", series.get("fill"));
      yRenderer.setAll({
        stroke: series.get("fill"),
        strokeOpacity: 1,
        opacity: 1
      });

      if (this.root instanceof Root) {
        series.data.processor = am5.DataProcessor.new(this.root, {
          dateFormat: "yyyy-MM-dd HH:mm:ss",
          dateFields: ["date"]
        });
      }

      this.seriesMap.set(sensorData.name, series);
    });

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(this.root, {
      xAxis: xAxis,
      behavior: "none"
    })).lineY.set("visible", false);

    // Add scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
      orientation: "horizontal"
    }));

    // Make stuff animate on load
    chart.appear(1000, 100);

    // Initialize data for all series
    this.updateSeriesData();
  }

  updateSeriesData() {
    if (!this.root) {
      return;
    }

    this.jsonData.forEach((sensorData) => {
      let series = this.seriesMap.get(sensorData.name);
      if (series) {
        // Update series data to only keep the last 15 values
        series.data.setAll(sensorData.data.slice(-15));
      }
    });
  }

  private disposeChart() {
    if (this.root) {
      this.root.dispose();
      this.root = undefined;
    }
  }
}
