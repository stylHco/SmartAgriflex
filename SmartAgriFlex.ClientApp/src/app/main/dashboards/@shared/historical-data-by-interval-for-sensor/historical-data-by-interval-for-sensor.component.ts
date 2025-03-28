import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit, Query,
  signal
} from '@angular/core';
import {
  CustomDashboardClient, DashboardIntervalTypeEnum,
  DashboardSensorTypeEnum, GetDataForSensorInputModel,

} from "../../../../@core/app-api";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import {EMPTY, Subject, takeUntil} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {CommonValidators} from "../../../../@shared/utils/common-validators";
import {AsyncPipe, NgIf, NgStyle} from "@angular/common";
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
import {nativeToLocalDate} from "../../../../@shared/date-time/joda.helpers";
import {CalendarModule} from "primeng/calendar";
import {BarChartComponent} from "../../../@shared/charts/components/bar-chart.component";
import {
  transformBarChartData
} from "../../../@shared/charts/pipes/transform-bar-chart";
import {catchError} from "rxjs/operators";
import {BarChartInterface} from "../../../@shared/charts/components/bar-chart-interface";
import {getDashboardMeasurementTypeText} from "../dashboard-sensor-measurement-type";
import {TRANSLOCO_SCOPE, TranslocoModule, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../../../@transloco/transloco.helpers";

interface SelectionFormInterface {
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
}

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-historical-data-by-interval-for-sensor/en.json'),
  lang => import(/* webpackChunkName: "live-historical-data-by-interval-for-sensor-i18n" */ `./i18n-historical-data-by-interval-for-sensor/${lang}.json`)
);

@Component({
  selector: 'app-historical-data-by-interval-for-sensor',
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
    NgStyle,
    BarChartComponent,
    TranslocoModule,
  ],
  templateUrl: './historical-data-by-interval-for-sensor.component.html',
  styleUrl: './historical-data-by-interval-for-sensor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'historicalData', loader: translocoLoader},
    },
  ],
})
export class HistoricalDataByIntervalForSensorComponent implements OnInit, OnDestroy {

  @Input()
  sensorType!: DashboardSensorTypeEnum;

  @Input()
  interval!: DashboardIntervalTypeEnum;

  @Input()
  widgetId!: string;

  @Input()
  title!: string;

  isLoading = signal(true);
  hasError = signal(false);

  transformedData!: BarChartInterface[];

  inputModel!: GetDataForSensorInputModel;
  form!: FormGroup<SelectionFormInterface>;
  startDateResult!: any;
  endDateResult!: any;


  destroy$ = new Subject<void>();

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
    this.fetchData();
  }


  formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Extracts "YYYY-MM-DD"
  };


  formatDateForDisplay = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  setDefaultDatesAndUpdateUrl() {
    this.urlInitialized = true;
    const now = new Date();
    this.endDateResult = new Date();

    switch (this.interval) {

      case DashboardIntervalTypeEnum.Hourly:
        // get current day
        this.startDateResult = new Date();
        break;

      case DashboardIntervalTypeEnum.Daily:
        // get current week
        const dailyStart = new Date(now);
        dailyStart.setHours(0, 0, 0, 0);
        this.startDateResult = dailyStart;
        break;

      case DashboardIntervalTypeEnum.Weekly:
        // Get current month
        this.startDateResult = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        break;

      case DashboardIntervalTypeEnum.Monthly:
        // get current year
        this.startDateResult = new Date(Date.UTC(now.getFullYear(), 0, 1));
        break;

      case DashboardIntervalTypeEnum.Yearly:
        // Get current year
        this.startDateResult = new Date(Date.UTC(now.getFullYear(), 0, 1));
        break;

      default:
        this.startDateResult = new Date();
        this.endDateResult = new Date();
        break;
    }

    this.updateUrlWithDates();
  }

  updateUrlWithDates() {
    const allQueryParams = this.activatedRoute.snapshot.queryParams;

// Check if query params already exist
    const hasQueryParams = Object.keys(allQueryParams).some(key =>
      key === `startDate_${this.widgetId}` || key === `endDate_${this.widgetId}`
    );

    if (!hasQueryParams) {
      this.router.navigate([], {
        queryParams: {
          [`startDate_${this.widgetId}`]: this.formatDate(this.startDateResult),
          [`endDate_${this.widgetId}`]: this.formatDate(this.endDateResult),
        },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
        replaceUrl: true, // Prevent adding new history entry
      });
    }
  }

  submitForm() {
    this.router.navigate([], {
      queryParams: {
        [`startDate_${this.widgetId}`]: nativeToLocalDate(this.form.controls.startDate.value),
        [`endDate_${this.widgetId}`]: nativeToLocalDate(this.form.controls.endDate.value),
      },
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
      replaceUrl: true, // Prevent adding new history entry
    });

    this.form.reset();
  }


  private buildCreateForm(): FormGroup<SelectionFormInterface> {
    return new FormGroup({
        startDate: new FormControl<Date | null>(null, {
          validators: [
            CommonValidators.required(),
          ],
        }),
        endDate: new FormControl<Date | null>(null, {
          validators: [
            CommonValidators.required(),
          ],
        }),
      },
    );
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
        if (!params || Object.keys(params).length === 0 ||
          !params[`startDate_${this.widgetId}`] || !params[`endDate_${this.widgetId}`]) {
          return;
        }

        this.hasError.set(false);
        this.isLoading.set(true);

        this.startDateResult =  (new Date(params[`startDate_${this.widgetId}`]));
        this.endDateResult = (new Date(params[`endDate_${this.widgetId}`]));

        this.inputModel = new GetDataForSensorInputModel({
          sensorTypeEnum: this.sensorType,
          intervalTypeEnum: this.interval,
          startDate: nativeToLocalDate(new Date(params[`startDate_${this.widgetId}`]))!,
          endDate: nativeToLocalDate(new Date(params[`endDate_${this.widgetId}`]))!,
        });

        this.customDashboardClient.getDataForSensor(this.inputModel).pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            this.hasError.set(true);
            this.isLoading.set(false);
            this.cd.markForCheck(); // Manually trigger UI update for error state
            return EMPTY;
          })
        ).subscribe(response => {
          this.transformedData = transformBarChartData(response, this.interval);
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

    protected readonly getDashboardMeasurementTypeText = getDashboardMeasurementTypeText;
}
