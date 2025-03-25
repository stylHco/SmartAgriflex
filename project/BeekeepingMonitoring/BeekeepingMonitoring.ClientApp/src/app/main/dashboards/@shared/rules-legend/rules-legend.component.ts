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
import {CustomDashboardClient, CustomRulesListModel, DashboardSensorTypeEnum} from "../../../../@core/app-api";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {EMPTY, interval, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {catchError} from "rxjs/operators";
import {CommonModule} from "@angular/common";
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {DashboardSensorMeasurementType} from "../dashboard-sensor-measurement-type";
import {Button} from "primeng/button";

@Component({
  selector: 'app-rules-legend',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ProgressSpinnerModule,
    Button
  ],
  templateUrl: "rules-legend.component.html",
  styleUrl: "rules-legend.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RulesLegendComponent implements OnInit, OnDestroy {
  @Input()
  sensorType!: DashboardSensorTypeEnum;
  @Input()
  title: string = "Legend";

  isLoading = signal(true);
  hasError = signal(false);

  customRules!: CustomRulesListModel[];
  destroy$ = new Subject<void>();

  constructor(
    private customDashboardClient: CustomDashboardClient,
    private cd: ChangeDetectorRef,
    protected readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData() {

    this.hasError.set(false);

    this.customDashboardClient.getCustomRulesForSensor(this.sensorType).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.cd.markForCheck(); // Manually trigger UI update for error state
        return EMPTY;
      })
    ).subscribe(response => {
      this.customRules = response;
      this.hasError.set(false);
      this.isLoading.set(false);

      this.cd.markForCheck(); // Ensure UI updates for new data
    });
  }


  // Retry logic (only called when the user presses Retry)
  retry() {
    this.fetchData();
  }

}
