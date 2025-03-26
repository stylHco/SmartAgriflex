import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LiveDataForSensorComponent} from "../../@shared/live-data-for-sensor/live-data-for-sensor.component";
import {LiveGaugeComponent} from "../../@shared/live-gauge/live-gauge.component";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {ActivatedRoute, Params} from "@angular/router";
import {
  CustomDashboardClient, DashboardIntervalTypeEnum,
  DashboardSensorTypeEnum
} from "../../../../@core/app-api";
import {BarChartComponent} from "../../../@shared/charts/components/bar-chart.component";
import {NgIf} from "@angular/common";
import {
  HistoricalDataByIntervalForSensorComponent
} from "../../@shared/historical-data-by-interval-for-sensor/historical-data-by-interval-for-sensor.component";
import {RulesLegendComponent} from "../../@shared/rules-legend/rules-legend.component";
import {DoubleLineChartComponent} from "../../../@shared/charts/components/double-line-chart.component";
import {transformDoubleLineData} from "../../../@shared/charts/pipes/transform-double-line-chart";
import {DoubleLineChartDateInterface} from "../../../@shared/charts/components/double-line-chart-interface";
import {YearToDateComparisonComponent} from "../../@shared/year-to-date-comparison/year-to-date-comparison.component";

@Component({
  selector: 'app-custom-dashboard',
  standalone: true,
  imports: [
    LiveDataForSensorComponent,
    LiveGaugeComponent,
    BarChartComponent,
    NgIf,
    HistoricalDataByIntervalForSensorComponent,
    RulesLegendComponent,
    DoubleLineChartComponent,
    YearToDateComparisonComponent
  ],
  templateUrl: './custom-dashboard.component.html',
  styleUrl: './custom-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomDashboardComponent implements OnInit {


  sensorType!: DashboardSensorTypeEnum;

  data!: DoubleLineChartDateInterface[];
initialized=false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private customDashboardClient: CustomDashboardClient,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd))
      .subscribe((params: Params) => {
        this.sensorType = params['sensorType'];
      });

    this.customDashboardClient.getYtdComparisonForSensor(this.sensorType, 2023, 2025)
      .pipe(
        autoMarkForCheck(this.cd)
      )
      .subscribe(data => {
        console.log((data))
        this.data = transformDoubleLineData(data);
        this.initialized = true
        // console.log(transformDoubleLineData(data))
      })


  }

  protected readonly DashboardIntervalTypeEnum = DashboardIntervalTypeEnum;
}
