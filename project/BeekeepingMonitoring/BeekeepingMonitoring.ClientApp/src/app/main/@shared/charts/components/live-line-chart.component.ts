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
  @Input() xAxisTitle!: string;
  @Input() yAxisTitle!: string;

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



  // The code here is inspired from am5 charts
  // the code can be found here https://www.amcharts.com/demos/live-data/
  generateChart() {
    // Create root element if not already created
    if (!this.root) {
      this.root = am5.Root.new(this.elementRef.nativeElement);
      this.root.setThemes([am5themes_Animated.new(this.root)]);
    }
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

    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(this.root, {
      maxDeviation: 0.5,
      extraMin: -0.1,
      extraMax: 0.1,
      groupData: false,
      baseInterval: {
        timeUnit: "second",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(this.root, {
        minorGridEnabled: true,
        minGridDistance: 60
      }),
      tooltip: am5.Tooltip.new(this.root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: am5xy.AxisRendererY.new(this.root, {}),
    }));




    this.jsonData.forEach((sensorData, index) => {
      let opposite = index % 2 !== 0;
      let yRenderer = am5xy.AxisRendererY.new(this.root!, {
        opposite: opposite
      });

      if (this.root instanceof Root) {
        yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(this.root, {
            maxDeviation: 1,
            renderer: yRenderer,
          })
        );
      }

      if (chart.yAxes.indexOf(yAxis) > 0) {
        yAxis.set("syncWithAxis", chart.yAxes.getIndex(0) as am5xy.ValueAxis<typeof yRenderer>);
      }

      let series: any;
      if (this.root instanceof Root) {
        series = chart.series.push(
          am5xy.LineSeries.new(this.root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            valueXField: "date",
            tooltip: am5.Tooltip.new(this.root, {
              labelText: "{valueY}"
            })
          })
        );
      }

      // Add bullets (data points)
      series.bullets.push(() =>
        am5.Bullet.new(this.root!, {
          sprite: am5.Circle.new(this.root!, {
            radius: 5, // Bullet size
            fill: series.get("fill"),
            strokeWidth: 2,
            stroke: this.root!.interfaceColors.get("background")
          })
        })
      );


      // Style adjustments
      series.strokes.template.setAll({ strokeWidth: 2 });
      yRenderer.grid.template.set("strokeOpacity", 0.05);
      yRenderer.labels.template.set("fill", series.get("fill"));
      yRenderer.template?.set("tooltip",am5.Tooltip.new(this.root!, {}))
      yRenderer.setAll({
        stroke: series.get("fill"),
        strokeOpacity: 1,
        opacity: 1
      });

      // Data processor for date format
      if (this.root instanceof Root) {
        series.data.processor = am5.DataProcessor.new(this.root, {
          dateFormat: "yyyy-MM-dd HH:mm:ss",
          dateFields: ["date"]
        });
      }

      this.seriesMap.set(sensorData.name, series);
    });

    // Add title to X Axis
    xAxis.children.push(am5.Label.new(this.root, {
      text: this.xAxisTitle,
      fontSize: 14,
      fontWeight: "bold",
      fill: am5.color(0x000000),
      textAlign: "center",
      x: am5.percent(50),
      centerX: am5.percent(50),
      paddingTop: 10
    }));

// Add title to Y Axis
    yAxis.children.push(am5.Label.new(this.root, {
      text: this.yAxisTitle,
      fontSize: 14,
      fontWeight: "bold",
      fill: am5.color(0x000000),
      rotation: -90,
      textAlign: "center",
      y: am5.percent(50),
      centerY: am5.percent(50),
      paddingRight: 10
    }));

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
    console.log(this.jsonData)
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
