import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {
  CustomDashboardClient,
  DashboardSensorTypeEnum,
} from "../../../../@core/app-api";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EMPTY, Subject, takeUntil} from "rxjs";
import {DeviceRepresentingService} from "../../../../@core/devices/device-representing.utils";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonValidators} from "../../../../@shared/utils/common-validators";
import {AsyncPipe, NgIf} from "@angular/common";
import {Button, ButtonDirective} from "primeng/button";
import {CardModule} from "primeng/card";
import {DropdownDefaultsModule} from "../../../../@shared/defaults/dropdown-defaults.module";
import {DropdownModule} from "primeng/dropdown";
import {FormControlErrorsModule} from "../../../../@shared/form-control-errors/form-control-errors.module";
import {FormLossPreventionModule} from "../../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {LiveLineChartComponent} from "../../../@shared/charts/components/live-line-chart.component";
import {
  RequiredFieldIndicatorModule
} from "../../../../@shared/required-field-indicator/required-field-indicator.module";
import {
  LoadablesTemplateUtilsModule
} from "../../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {catchError} from "rxjs/operators";
import {DoubleLineChartDateInterface} from "../../../@shared/charts/components/double-line-chart-interface";
import {transformDoubleLineData} from "../../../@shared/charts/pipes/transform-double-line-chart";
import {CalendarModule} from "primeng/calendar";
import {DoubleLineChartComponent} from "../../../@shared/charts/components/double-line-chart.component";

interface formInterface {
  year1: FormControl<Date | null>;
  year2: FormControl<Date | null>;
}

@Component({
  selector: 'app-year-to-date-comparison',
  standalone: true,
  imports: [
    AsyncPipe,
    ButtonDirective,
    CardModule,
    DropdownDefaultsModule,
    DropdownModule,
    FormControlErrorsModule,
    FormLossPreventionModule,
    FormsModule,
    LiveLineChartComponent,
    NgIf,
    ReactiveFormsModule,
    RequiredFieldIndicatorModule,
    LoadablesTemplateUtilsModule,
    Button,
    CalendarModule,
    DoubleLineChartComponent
  ],
  templateUrl: './year-to-date-comparison.component.html',
  styleUrl: './year-to-date-comparison.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YearToDateComparisonComponent implements OnInit, OnDestroy {

  @Input()
  sensorType!: DashboardSensorTypeEnum;

  @Input()
  widgetId: string = "MonthlyYTDWidget";

  @Input()
  title!: string;

  isLoading = signal(true);
  hasError = signal(false);

  destroy$ = new Subject<void>();

  transformedData!: DoubleLineChartDateInterface[];
  form!: FormGroup<formInterface>;
  year1Result!: any;
  year2Result!: any;
  urlInitialized = false;

  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private cd: ChangeDetectorRef,
    private customDashboardClient: CustomDashboardClient
  ) {
  }

  ngOnInit() {
    this.form = this.buildCreateForm();
    if (!this.urlInitialized) {
      this.setDefaultDatesAndUpdateUrl();
    }
    this.form = this.buildCreateForm();
    this.fetchData();
  }

  setDefaultDatesAndUpdateUrl() {
    this.urlInitialized = true;
    let year2 = new Date().getFullYear()
    let year1 = year2 - 1

    const allQueryParams = this.activatedRoute.snapshot.queryParams;

// Check if query params already exist
    const hasQueryParams = Object.keys(allQueryParams).some(key =>
      key === `year1_${this.widgetId}` || key === `year2_${this.widgetId}`
    );

    if (!hasQueryParams) {
      this.router.navigate([], {
        queryParams: {
          [`year1_${this.widgetId}`]: (year1),
          [`year2_${this.widgetId}`]: (year2),
        },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
        replaceUrl: true, // Prevent adding new history entry
      });
    }

  }


  submitForm() {
    if (this.form.controls.year1.value !== undefined
      && this.form.controls.year2.value !== undefined) {

      this.router.navigate([], {
        queryParams: {
          [`year1_${this.widgetId}`]: Number(this.form.controls.year1.value?.getFullYear()),
          [`year2_${this.widgetId}`]: Number(this.form.controls.year2.value?.getFullYear()),
        },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
        replaceUrl: true, // Prevent adding new history entry
      });

    } else {
      console.error("year1 or year2 undefined!!");
    }

    this.form.reset();
  }

  private buildCreateForm(): FormGroup<formInterface> {
    return new FormGroup({
      year1: new FormControl<Date | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
      year2: new FormControl<Date | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData() {
    this.activatedRoute.queryParams
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe((params) => {
        this.hasError.set(false);
        this.isLoading.set(true);

        this.year1Result = ((params[`year1_${this.widgetId}`]));
        this.year2Result = ((params[`year2_${this.widgetId}`]));

        this.customDashboardClient.getYtdComparisonForSensor(this.sensorType, this.year1Result, this.year2Result).pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            this.hasError.set(true);
            this.isLoading.set(false);
            this.cd.markForCheck(); // Manually trigger UI update for error state
            return EMPTY;
          })
        ).subscribe(response => {
          this.transformedData = transformDoubleLineData(response);
          this.hasError.set(false);
          this.isLoading.set(false);
          this.cd.markForCheck(); // Ensure UI updates for new data
        });
      });
  }


  // the retry logic is only caled when the user presed retry after a badrequest.
  retry() {
    this.fetchData();
  }

}
