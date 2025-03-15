import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {
  CustomDashboardClient,
  CustomDashboardDataFullDetailsModel,
  DashboardSensorTypeEnum,
  DeviceReferenceModel,
  SensorReferenceModel
} from "../../../../@core/app-api";
import {transformData2, TransformedData} from "../../../charts/transformation-of-data";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {interval, Observable, Subscription, switchMap} from "rxjs";
import {SensorOption, SensorRepresentingService} from "../../../../@core/sensors/sensor-representing.utils";
import {DeviceOption, DeviceRepresentingService} from "../../../../@core/devices/device-representing.utils";
import {Loadable} from "../../../../@shared/loadables/loadable";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {CommonValidators} from "../../../../@shared/utils/common-validators";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonDirective} from "primeng/button";
import {CardModule} from "primeng/card";
import {DropdownDefaultsModule} from "../../../../@shared/defaults/dropdown-defaults.module";
import {DropdownModule} from "primeng/dropdown";
import {FormControlErrorsModule} from "../../../../@shared/form-control-errors/form-control-errors.module";
import {FormLossPreventionModule} from "../../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {LiveLineChartComponent} from "../../../charts/live-line-chart.component";
import {
  RequiredFieldIndicatorModule
} from "../../../../@shared/required-field-indicator/required-field-indicator.module";
import {
  LoadablesTemplateUtilsModule
} from "../../../../@shared/loadables/template-utils/loadables-template-utils.module";

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
    LoadablesTemplateUtilsModule
  ],
  templateUrl: './live-data-for-sensor.component.html',
  styleUrl: './live-data-for-sensor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveDataForSensorComponent implements OnInit{

  public sensorType!: DashboardSensorTypeEnum;


  availableSensorsResults: SensorReferenceModel[] = [];
  availableSensorsFormResult!: SensorReferenceModel;
  availableSensors: SensorReferenceModel[] = [];
  availableSensorsOptions$!: Observable<SensorOption<SensorReferenceModel>[]>;

  availableDevicesResults: DeviceReferenceModel[] = [];
  availableDevicesFormResult!: DeviceReferenceModel;
  availableDevices: DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;

  specificSensorData!: CustomDashboardDataFullDetailsModel[];
  transformedData!: TransformedData[];


  form!: FormGroup<SensorSelectionForm>;

  dataLoadable!: Loadable<TransformedData[]>;

  dataIsLoaded = false;

  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private sensorRepresentingService: SensorRepresentingService,
    private deviceRepresentingService: DeviceRepresentingService,
    private  customDashboardClient: CustomDashboardClient
  ) {
  }

  private pollingSubscription: Subscription | undefined;

  ngOnInit() {
    const routeData = this.activatedRoute.snapshot.data;
    this.availableSensorsOptions$ = this.sensorRepresentingService.getOptions(this.availableSensorsResults);
    // this.availableDevices = (routeData['availableDevices'] as ApiResult<DeviceReferenceModel[]>).value!;
    // this.availableDevices.unshift(new DeviceReferenceModel({id: -1, name: 'Select All', nickname: ''}));
    // this.availableDevicesResults = this.availableDevices
    // this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);
    //
    // this.form = this.buildCreateForm();

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

        let deviceId: string = params['liveDataDeviceId'];
        if (!isNaN(Number(deviceId))) {
          this.availableDevicesFormResult = this.availableDevices.find(ad => ad.id === Number(deviceId))!;
        }
        // Start polling
        this.startPolling(deviceId ? deviceId!.toString() : "all");

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

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling(deviceId: string | null) {
    this.stopPolling();

    this.pollingSubscription = interval(1000).pipe(
      switchMap(() =>
        this.customDashboardClient.getLiveDataForSensor(DashboardSensorTypeEnum.Temperature, deviceId!).pipe(
          switchMap(data => {
            this.specificSensorData = data;
            this.dataIsLoaded = true;
            return this.transformedData = transformData2(this.specificSensorData);
          })
        )
      ),
      autoMarkForCheck(this.cd)
    )
      .subscribe();
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
      this.dataIsLoaded = false;
    }
  }


}
