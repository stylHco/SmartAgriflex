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
import {
  CustomDashboardClient,
  CustomDashboardDataFullDetailsModel,
  DashboardSensorTypeEnum,
  DeviceReferenceModel, DevicesClient,
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

interface SensorSelectionForm {
  device: FormControl<DeviceReferenceModel | null>;
}

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
    Button
  ],
  templateUrl: './live-data-for-sensor.component.html',
  styleUrl: './live-data-for-sensor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveDataForSensorComponent implements OnInit, OnDestroy {

  @Input()
  sensorType!: DashboardSensorTypeEnum;

  isLoading = signal(false);
  hasError = signal(false);


  pollingSubscription: Subscription | null = null;
  destroy$ = new Subject<void>();

  availableDevicesResults: DeviceReferenceModel[] = [];
  availableDevicesFormResult!: DeviceReferenceModel;
  availableDevices: DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;

  specificSensorData!: CustomDashboardDataFullDetailsModel[];
  transformedData!: TransformedData[];
  form!: FormGroup<SensorSelectionForm>;
  dataLoadable!: Loadable<TransformedData[]>;

  deviceId!: string;
  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private deviceRepresentingService: DeviceRepresentingService,
    private devicesClient: DevicesClient,
    private customDashboardClient: CustomDashboardClient
  ) {
  }

  ngOnInit() {

    this.customDashboardClient.filterDevices(null, this.sensorType)
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe(data =>{
        this.availableDevices = data;
        this.availableDevices.unshift(new DeviceReferenceModel({id: -1, name: 'All(Average)', nickname: ''}));
        this.availableDevicesResults = this.availableDevices
        this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);
      })

    this.form = this.buildCreateForm();

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

        this.deviceId = params['liveDataDeviceId'];
        if (!isNaN(Number(this.deviceId))) {
          this.availableDevicesFormResult = this.availableDevices.find(ad => ad.id === Number(this.deviceId))!;
        }
        // Start polling
        this.fetchData(this.sensorType, true, this.deviceId ? this.deviceId!.toString() : "all");

      });

  }

  submitForm() {
    if (this.form.controls.device.value?.id !== undefined) {

      let deviceId!: string;

      if (this.form.controls.device.value.id != -1) {
        deviceId = this.form.controls.device.value.id.toString();
      } else {
        deviceId = 'all'
      }

      this.ngZone.run(() => {
        this.router.navigate([{liveDataDeviceId: deviceId}], {relativeTo: this.activatedRoute});
      });
    } else {
      console.error("Sensor id or Device Id is undefined!!");
    }

    this.form.reset();

  }

  private buildCreateForm(): FormGroup<SensorSelectionForm> {
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


    this.customDashboardClient.getLiveDataForSensor(DashboardSensorTypeEnum.Temperature, deviceId!).pipe(
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
      this.transformedData = transformData2(this.specificSensorData);
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
        this.customDashboardClient.getLiveDataForSensor(DashboardSensorTypeEnum.Temperature, deviceId!).pipe(
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

}
