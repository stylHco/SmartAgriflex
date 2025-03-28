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
import {DashboardSensorMeasurementType, getDashboardMeasurementTypeWithSymbols} from "../dashboard-sensor-measurement-type";
import {Button} from "primeng/button";
import {createTranslocoLoader} from "../../../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoModule, TranslocoScope} from "@ngneat/transloco";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-live-gauge/en.json'),
  lang => import(/* webpackChunkName: "live-live-gauge-i18n" */ `./i18n-live-gauge/${lang}.json`)
);
@Component({
  selector: 'app-live-gauge',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ProgressSpinnerModule,
    Button,
    TranslocoModule
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'liveGauge', loader: translocoLoader},
    },
  ],
})

export class LiveGaugeComponent implements OnInit, OnDestroy {
  @Input()
  sensorType!: DashboardSensorTypeEnum;
  @Input()
  deviceIdsStr: string | null = null;
  @Input()
  title: string | null = null;

  isLoading = signal(false);
  hasError = signal(false);
  liveMeasurement!: number;
  liveMeasurementType!: string | null;
  pollingSubscription: Subscription | null = null;
  destroy$ = new Subject<void>();

  constructor(
    private customDashboardClient: CustomDashboardClient,
    private cd: ChangeDetectorRef,
    protected readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.fetchData(true);

    this.liveMeasurementType = getDashboardMeasurementTypeWithSymbols(this.sensorType);
  }
  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData(isFirstLoad: boolean = false) {
    if (isFirstLoad) {
      this.isLoading.set(true);
      this.cd.markForCheck(); // Ensure UI updates for loading state
    }

    this.hasError.set(false);

    this.customDashboardClient.getLiveGaugeAllDevicesAverage(this.sensorType).pipe(
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
      this.startPolling();
    });
  }

  private startPolling() {
    this.stopPolling();

    this.pollingSubscription = interval(60000) // Every 1 minute
      .pipe(
        switchMap(() => this.customDashboardClient.getLiveGaugeAllDevicesAverage(this.sensorType).pipe(
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
    this.fetchData(true);
  }

  protected readonly Number = Number;
}
