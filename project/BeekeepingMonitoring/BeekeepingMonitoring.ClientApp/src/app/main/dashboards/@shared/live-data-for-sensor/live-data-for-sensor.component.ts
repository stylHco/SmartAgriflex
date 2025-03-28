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
  CustomDashboardDataFullDetailsModel,
  DashboardSensorTypeEnum,
  DeviceReferenceModel,
} from "../../../../@core/app-api";
import {transformData2, TransformedData} from "../../../@shared/charts/pipes/transformation-time-line-chart";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EMPTY, interval, Observable, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {DeviceOption, DeviceRepresentingService} from "../../../../@core/devices/device-representing.utils";
import {Loadable} from "../../../../@shared/loadables/loadable";
import {ActivatedRoute, Params, Router} from "@angular/router";
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
import {
  getDashboardMeasurementTypeText,
} from "../dashboard-sensor-measurement-type";
import {TRANSLOCO_SCOPE, TranslocoModule, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../../../@transloco/transloco.helpers";

interface DeviceSelectionForm {
  device: FormControl<DeviceReferenceModel | null>;
}

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-live-data-for-sensor/en.json'),
  lang => import(/* webpackChunkName: "live-data-for-sensor-i18n" */ `./i18n-live-data-for-sensor/${lang}.json`)
);

@Component({
  selector: 'app-live-data-for-sensor',
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
    TranslocoModule
  ],
  templateUrl: './live-data-for-sensor.component.html',
  styleUrl: './live-data-for-sensor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'liveData', loader: translocoLoader},
    },
  ],
})
export class LiveDataForSensorComponent implements OnInit, OnDestroy {

  @Input()
  sensorType!: DashboardSensorTypeEnum;

  @Input()
  widgetId: string = "liveDataWidget";

  @Input()
  title!: string;

  isLoading = signal(false);
  hasError = signal(false);


  pollingSubscription: Subscription | null = null;
  destroy$ = new Subject<void>();

  availableDevicesResults: DeviceReferenceModel[] = [];
  availableDevices: DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;

  specificSensorData!: CustomDashboardDataFullDetailsModel[];
  transformedData!: TransformedData[];
  form!: FormGroup<DeviceSelectionForm>;

  selectedDevice!: string;


  deviceId!: string;

  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private cd: ChangeDetectorRef,
    private deviceRepresentingService: DeviceRepresentingService,
    private customDashboardClient: CustomDashboardClient
  ) {
  }

  ngOnInit() {
    this.isLoading.set(true);
    this.customDashboardClient.filterDevices(null, this.sensorType)
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe(data => {
        this.availableDevices = data;
        this.availableDevices.unshift(new DeviceReferenceModel({id: -1, name: 'All(Average)', nickname: ''}));
        this.availableDevicesResults = this.availableDevices
        this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);
        this.activatedRoute.queryParams
          .pipe(
            autoMarkForCheck(this.cd),
          )
          .subscribe((params: Params) => {
            this.deviceId = params[`deviceId_${this.widgetId}`];
            this.selectedDevice = this.availableDevices.find(d => d.id == (
              this.deviceId != "all" ? Number(this.deviceId) : -1))?.name!
            this.fetchData(this.sensorType, true, this.deviceId ? this.deviceId!.toString() : "all");
          });
      });
    this.form = this.buildCreateForm();
  }

  submitForm() {
    if (this.form.controls.device.value?.id !== undefined) {

      let deviceId!: string;

      if (this.form.controls.device.value.id != -1) {
        deviceId = this.form.controls.device.value.id.toString();
      } else {
        deviceId = 'all'
      }

      this.router.navigate([], {
        queryParams: {
          [`deviceId_${this.widgetId}`]: deviceId,
        },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
        replaceUrl: true, // Prevent adding new history entry
      });
    } else {
      console.error("Sensor id or Device Id is undefined!!");
    }

    this.form.reset();

  }

  private buildCreateForm(): FormGroup<DeviceSelectionForm> {
    return new FormGroup({
      device: new FormControl<DeviceReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }


  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData(sensorType: DashboardSensorTypeEnum, isFirstLoad: boolean = false, deviceId: string | null) {
    if (isFirstLoad) {
      this.isLoading.set(true);
      this.cd.markForCheck(); // Ensure UI updates for loading state
    }

    this.hasError.set(false);


    this.customDashboardClient.getLiveDataForSensor(sensorType, deviceId!).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.stopPolling(); // Stop polling if an error occurs
        this.cd.markForCheck(); // Manually trigger UI update for error state
        return EMPTY;
      })
    ).subscribe(response => {
      this.specificSensorData = response;
      this.transformedData = transformData2(response);
      this.hasError.set(false);
      this.isLoading.set(false);

      this.cd.markForCheck(); // Ensure UI updates for new data

      // Start polling every 1 minute after we ensures that we fetch the data successfully
      this.startPolling(sensorType, deviceId);
    });
  }

  private startPolling(sensorType: DashboardSensorTypeEnum, deviceId: string | null) {
    this.stopPolling();

    this.pollingSubscription = interval(60000).pipe(
      switchMap(() =>
        this.customDashboardClient.getLiveDataForSensor(sensorType, deviceId!).pipe(
          catchError(err => {
            this.hasError.set(true);
            this.stopPolling(); // Stop polling on error
            this.cd.markForCheck(); // Manually update UI to reflect the error
            return EMPTY;
          })
        )),
      takeUntil(this.destroy$)
    )
      .subscribe(data => {
        this.specificSensorData = data;
        this.transformedData = transformData2(this.specificSensorData);
        console.log(data)
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

  // the retry logic is only caled when the user presed retry after a badrequest.
  retry() {
    this.fetchData(this.sensorType, true, this.deviceId ? this.deviceId!.toString() : "all");
  }

  protected readonly getDashboardMeasurementTypeText = getDashboardMeasurementTypeText;
}
