import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterModule} from "@angular/router";
import {
  DeviceReferenceModel, SensorDeviceDatasClient, SensorDeviceDatasListModel,
  SensorReferenceModel,
  SensorsDataFullDetailsModel,
  SensorsListModel
} from "../../../@core/app-api";
import {ApiResult} from "../../../@shared/utils/api-result";
import {
  transformData, transformData2,
  TransformedData
} from "../../charts/transformation-of-data";
import {CommonModule} from "@angular/common";
import {LineChartComponent} from "../../charts/line-chart.component";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {SensorOption, SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {interval, Observable, Subscription, switchMap} from "rxjs";
import {autoMarkForCheck} from "../../../@shared/utils/change-detection-helpers";
import {CommonValidators} from "../../../@shared/utils/common-validators";
import {FormLossPreventionModule} from "../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {RequiredFieldIndicatorModule} from "../../../@shared/required-field-indicator/required-field-indicator.module";
import {DropdownModule} from "primeng/dropdown";
import {DropdownDefaultsModule} from "../../../@shared/defaults/dropdown-defaults.module";
import {FormControlErrorsModule} from "../../../@shared/form-control-errors/form-control-errors.module";
import {ButtonModule} from "primeng/button";
import {PanelModule} from "primeng/panel";
import {CardModule} from "primeng/card";
import {SensorChartLegendComponent} from "../../@shared/sensor-chart-legend/sensor-chart-legend.component";
import {LiveLineChartComponent} from "../../charts/live-line-chart.component";
import {DeviceOption, DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {Loadable} from "../../../@shared/loadables/loadable";
import {LoadablesTemplateUtilsModule} from "../../../@shared/loadables/template-utils/loadables-template-utils.module";

interface SensorSelectionForm {
  sensor: FormControl<SensorReferenceModel | null>;
  device: FormControl<DeviceReferenceModel | null>;
}

@Component({
  selector: 'app-view-live-charts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LineChartComponent,
    ReactiveFormsModule,
    FormLossPreventionModule,
    RequiredFieldIndicatorModule,
    DropdownModule,
    DropdownDefaultsModule,
    FormControlErrorsModule,
    ButtonModule,
    PanelModule,
    CardModule,
    SensorChartLegendComponent,
    LiveLineChartComponent,
    LiveLineChartComponent,
    LoadablesTemplateUtilsModule,
  ],
  templateUrl: './view-live-charts.component.html',
  styleUrl: './view-live-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewLiveChartsComponent implements OnInit {
  availableSensorsResults: SensorReferenceModel[] = [];
  availableSensorsFormResult!: SensorReferenceModel;
  availableSensors: SensorReferenceModel[] = [];
  availableSensorsOptions$!: Observable<SensorOption<SensorReferenceModel>[]>;

  availableDevicesResults: DeviceReferenceModel[] = [];
  availableDevicesFormResult!: DeviceReferenceModel;
  availableDevices: DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;

  sensorsFullData: SensorDeviceDatasListModel[] = [];

  specificSensorData!: SensorsDataFullDetailsModel[];
  transformedData!: TransformedData[];
  sensorInfo: SensorsListModel[] = [];

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
    private sensorDeviceDatasClient: SensorDeviceDatasClient
  ) {
  }

  private pollingSubscription: Subscription | undefined;

  ngOnInit() {
    const routeData = this.activatedRoute.snapshot.data;
    this.sensorInfo = (routeData['sensorInfo'] as ApiResult<SensorsListModel[]>).value!;
    this.availableSensors = (routeData['availableSensors'] as ApiResult<SensorReferenceModel[]>).value!;
    this.availableSensors.unshift(new SensorReferenceModel({id: -1, name: 'Select All', description: ''}));
    this.availableSensorsResults = this.availableSensors
    this.availableSensorsOptions$ = this.sensorRepresentingService.getOptions(this.availableSensorsResults);
    this.availableDevices = (routeData['availableDevices'] as ApiResult<DeviceReferenceModel[]>).value!;
    this.availableDevices.unshift(new DeviceReferenceModel({id: -1, name: 'Select All', nickname: ''}));
    this.availableDevicesResults = this.availableDevices
    this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);

    this.form = this.buildCreateForm();

    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe((params: Params) => {
        let sensorId: string = params['sensorId'];
        let deviceId: string = params['deviceId'];
        if (!isNaN(Number(sensorId))) {
          this.availableSensorsFormResult = this.availableSensors.find(as => as.id === Number(sensorId))!;
        }
        if (!isNaN(Number(deviceId))) {
          this.availableDevicesFormResult = this.availableDevices.find(ad => ad.id === Number(deviceId))!;
        }
        // Start polling
        this.startPolling(sensorId!.toString(), deviceId!.toString());

      });

  }

  submitForm() {
    if (this.form.controls.sensor.value?.id !== undefined
      && this.form.controls.device.value?.id !== undefined) {

      let sensorId!: string;
      let deviceId!: string;

      if (this.form.controls.sensor.value.id != -1) {
        sensorId = this.form.controls.sensor.value.id.toString();
      } else {
        sensorId = 'all';
      }

      if (this.form.controls.device.value.id != -1) {
        deviceId = this.form.controls.device.value.id.toString();
      } else {
        deviceId = 'all'
      }

      this.ngZone.run(() => {
        this.router.navigate([{sensorId: sensorId, deviceId: deviceId}], {relativeTo: this.activatedRoute});
      });
    } else {
      console.error("Sensor id or Device Id is undefined!!");
    }

    this.form.reset();

  }

  private buildCreateForm(): FormGroup<SensorSelectionForm> {
    return new FormGroup({
      sensor: new FormControl<SensorReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
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

  private startPolling2(sensorId: string | null, deviceId: string | null) {
    this.stopPolling();
    if (!this.dataLoadable) {


      this.dataLoadable = new Loadable<TransformedData[]>(() =>
        this.sensorDeviceDatasClient.getForSensor(sensorId!, deviceId!).pipe(
          switchMap(data => {
            this.specificSensorData = data;
            this.transformedData = transformData2(data);
            console.log(data)
            console.log(this.transformedData)
            return [this.transformedData];
          })
        )
      );
    }

    this.pollingSubscription = interval(1000).pipe(
      switchMap(() => {
        this.dataLoadable!.loadFresh();
        return this.dataLoadable!.state$;
      }),
      autoMarkForCheck(this.cd)
    ).subscribe({
      error: (err) => {
        console.error('Polling error:', err);
        this.stopPolling();
      }
    });
  }

  private startPolling(sensorId: string | null, deviceId: string | null) {
    this.stopPolling();

    this.pollingSubscription = interval(1000).pipe(
      switchMap(() =>
        this.sensorDeviceDatasClient.getForSensor(sensorId!, deviceId!).pipe(
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
