import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LiveDataForSensorComponent} from "../../@shared/live-data-for-sensor/live-data-for-sensor.component";
import {LiveGaugeComponent} from "../../@shared/live-gauge/live-gauge.component";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {ActivatedRoute, Params} from "@angular/router";
import {
  CustomDashboardClient, DashboardIntervalTypeEnum,
  DashboardSensorTypeEnum,
} from "../../../../@core/app-api";
import {SingleBarChartTitleComponent} from "../../../@shared/charts/components/single-bar-chart-title.component";
import {BarChartComponent} from "../../../@shared/charts/components/bar-chart.component";
import {TransformSingleBarChartPipe} from "../../../@shared/charts/pipes/transform-single-bar-chart.pipe";
import {NgIf} from "@angular/common";
import {
  HistoricalDataByIntervalForSensorComponent
} from "../../@shared/historical-data-by-interval-for-sensor/historical-data-by-interval-for-sensor.component";
import {RulesLegendComponent} from "../../@shared/rules-legend/rules-legend.component";

@Component({
  selector: 'app-custom-dashboard',
  standalone: true,
  imports: [
    LiveDataForSensorComponent,
    LiveGaugeComponent,
    SingleBarChartTitleComponent,
    BarChartComponent,
    TransformSingleBarChartPipe,
    NgIf,
    HistoricalDataByIntervalForSensorComponent,
    RulesLegendComponent
  ],
  templateUrl: './custom-dashboard.component.html',
  styleUrl: './custom-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomDashboardComponent implements OnInit{


  sensorType!: DashboardSensorTypeEnum;

loaded = false;
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

  }

  protected readonly DashboardIntervalTypeEnum = DashboardIntervalTypeEnum;
}
