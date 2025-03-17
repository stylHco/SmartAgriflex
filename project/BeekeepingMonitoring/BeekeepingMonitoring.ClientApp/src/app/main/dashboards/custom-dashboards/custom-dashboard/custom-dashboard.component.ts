import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LiveDataForSensorComponent} from "../../@shared/live-data-for-sensor/live-data-for-sensor.component";
import {LiveGaugeComponent} from "../../@shared/live-gauge/live-gauge.component";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {ActivatedRoute, Params} from "@angular/router";
import {CustomDashboardClient, DashboardSensorTypeEnum} from "../../../../@core/app-api";

@Component({
  selector: 'app-custom-dashboard',
  standalone: true,
  imports: [
    LiveDataForSensorComponent,
    LiveGaugeComponent
  ],
  templateUrl: './custom-dashboard.component.html',
  styleUrl: './custom-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomDashboardComponent implements OnInit{

  sensorType!: DashboardSensorTypeEnum;

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

}
