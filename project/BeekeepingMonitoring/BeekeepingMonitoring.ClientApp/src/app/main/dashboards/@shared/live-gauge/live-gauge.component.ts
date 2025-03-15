import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {CardModule} from "primeng/card";
import {CustomDashboardClient, DashboardSensorTypeEnum} from "../../../../@core/app-api";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {EMPTY, interval, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {catchError} from "rxjs/operators";
import {CommonModule} from "@angular/common";
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-live-gauge',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ProgressSpinnerModule
  ],
  templateUrl: "./live-gauge.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LiveGaugeComponent implements OnInit {

  liveMeasurement!: number;
  public sensorType!: DashboardSensorTypeEnum;
  error: string | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>(); // To handle unsubscription
  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private customDashboardClient: CustomDashboardClient
  ) {
  }

  private pollingSubscription: Subscription | undefined;

  ngOnInit() {
    const routeData = this.activatedRoute.snapshot.data;

    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe((params: Params) => {
        const sensor: string = params['sensorType'];
        // Convert sensor from string to Enum
        if (sensor && Object.values(DashboardSensorTypeEnum).includes(sensor as DashboardSensorTypeEnum)) {
          this.sensorType = sensor as DashboardSensorTypeEnum;
        }
        // Start polling
        this.startPolling(this.sensorType);

      });

  }
  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling(sensorType: DashboardSensorTypeEnum | null) {
    this.stopPolling();

    this.pollingSubscription = interval(1000)
      .pipe(
        switchMap(() => {
          this.isLoading = true;
          return this.customDashboardClient.getLiveGauge(DashboardSensorTypeEnum.Temperature).pipe(
            catchError(err => {
              this.error = 'Error fetching data';
              this.isLoading = false;
              return EMPTY; // Prevents the stream from breaking
            })
          );
        }),
        autoMarkForCheck(this.cd), // Correct placement
        takeUntil(this.destroy$) // Cleanup on component destroy
      )
      .subscribe(
        (response) => {
          this.liveMeasurement = response;
          this.error = null;
          this.isLoading = false; // Hide loading state after data is fetched
        },
        (err) => {
          console.error('Error:', err);
          this.isLoading = false;
        }
      );
  }
  retry() {
    this.error = null;
    this.ngOnInit(); // Restart data fetching
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
      this.isLoading = false;
    }
  }

}
