import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {CardModule} from "primeng/card";
import {CustomDashboardClient, DashboardSensorTypeEnum} from "../../../../@core/app-api";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {EMPTY, interval, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {catchError} from "rxjs/operators";
import {CommonModule} from "@angular/common";
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {DashboardSensorMeasurementType} from "../dashboard-sensor-measurement-type";
import {Button} from "primeng/button";

@Component({
  selector: 'app-live-gauge',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ProgressSpinnerModule,
    Button
  ],
  templateUrl: "./live-gauge.component.html",
  styles: [
    `
      .liveMeasurement {
        font-size: 50px;
        padding: 0;
        text-align: center;;
        margin: 0 !important;
      }
      .loading, .errorMessage {
        text-align: center;
        padding: 10px;
        margin: 10px;
        i {
          font-size: 30px !important;
        }
      }

    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LiveGaugeComponent implements OnInit, OnDestroy {
  @Input()
  sensorType!: DashboardSensorTypeEnum;

  sensorTypeInside!: DashboardSensorTypeEnum;


  isLoading = signal(false);
  hasError = signal(false);
  liveMeasurement!: number;
  liveMeasurementType!: DashboardSensorMeasurementType;
  pollingSubscription: Subscription | null = null;
  destroy$ = new Subject<void>();

  constructor(
    private customDashboardClient: CustomDashboardClient,
    private cd: ChangeDetectorRef,
    protected readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd))
      .subscribe((params: Params) => {
        this.sensorTypeInside = params['sensorType'];
      });
    this.fetchData(this.sensorType, true);

    switch (this.sensorType) {
      case DashboardSensorTypeEnum.Temperature:
        this.liveMeasurementType = DashboardSensorMeasurementType.Celsius;
        break;
      case DashboardSensorTypeEnum.Humidity:
        this.liveMeasurementType = DashboardSensorMeasurementType.Percent;
        break;
      case DashboardSensorTypeEnum.WindSpeed:
        this.liveMeasurementType = DashboardSensorMeasurementType.MetersPerSecond;
        break;
      case DashboardSensorTypeEnum.WindDirection:
        this.liveMeasurementType = DashboardSensorMeasurementType.Degrees;
        break;
      case DashboardSensorTypeEnum.Light:
        this.liveMeasurementType = DashboardSensorMeasurementType.Lux;
        break;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData(sensorType: DashboardSensorTypeEnum, isFirstLoad: boolean = false) {
    if (isFirstLoad) {
      this.isLoading.set(true);
      this.cd.markForCheck(); // Ensure UI updates for loading state
    }

    this.hasError.set(false);

    this.customDashboardClient.getLiveGauge(sensorType).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.hasError.set(true);
        this.isLoading.set(false);

        this.stopPolling(); // Stop polling if an error occurs
        this.cd.markForCheck(); // Manually trigger UI update for error state
        return EMPTY;
      })
    ).subscribe(response => {
      this.liveMeasurement = response;
      this.hasError.set(false);
      this.isLoading.set(false);

      this.cd.markForCheck(); // Ensure UI updates for new data

      // Start polling every 1 minute after we ensure that we fetch the data successfully
      this.startPolling(sensorType);
    });
  }

  private startPolling(sensorType: DashboardSensorTypeEnum) {
    this.stopPolling();

    this.pollingSubscription = interval(60000) // Every 1 minute
      .pipe(
        switchMap(() => this.customDashboardClient.getLiveGauge(sensorType).pipe(
          catchError(err => {
            this.hasError.set(true);
            this.stopPolling(); // Stop polling on error
            this.cd.markForCheck(); // Manually update UI to reflect the error
            return EMPTY;
          })
        )),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        this.liveMeasurement = response;
        this.hasError.set(false);
        this.cd.markForCheck(); // Ensure UI updates with new live data
      });
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  // Retry logic (only called when the user presses Retry)
  retry() {
    this.fetchData(this.sensorType, true);
  }

}
