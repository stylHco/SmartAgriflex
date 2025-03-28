import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterModule} from "@angular/router";
import {

  DeviceReferenceModel, SensorDeviceDatasClient,
  SensorReferenceModel, SensorsLiveDataFullDetailsModel
} from "../../../@core/app-api";
import {ApiResult} from "../../../@shared/utils/api-result";
import {
   transformData2,
  TransformedData
} from "../../@shared/charts/pipes/transformation-time-line-chart";
import {CommonModule} from "@angular/common";
import {LineChartComponent} from "../../@shared/charts/components/line-chart.component";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {SensorOption, SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {EMPTY, interval, Observable, Subject, Subscription, switchMap, takeUntil} from "rxjs";
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
import {LiveLineChartComponent} from "../../@shared/charts/components/live-line-chart.component";
import {DeviceOption, DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {Loadable} from "../../../@shared/loadables/loadable";
import {LoadablesTemplateUtilsModule} from "../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {catchError} from "rxjs/operators";
import {getDashboardMeasurementTypeText} from "../../dashboards/@shared/dashboard-sensor-measurement-type";
import {TranslocoModule} from "@ngneat/transloco";

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
    TranslocoModule,
  ],
  templateUrl: './view-live-charts.component.html',
  styleUrl: './view-live-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewLiveChartsComponent implements OnInit, OnDestroy {


  isLoading = signal(false);
  hasError = signal(false);
  firstTime = signal(true);


  pollingSubscription: Subscription | null = null;
  destroy$ = new Subject<void>();

  availableSensorsResults: SensorReferenceModel[] = [];
  availableSensorsFormResult!: SensorReferenceModel;
  availableSensors: SensorReferenceModel[] = [];
  availableSensorsOptions$!: Observable<SensorOption<SensorReferenceModel>[]>;

  availableDevicesResults: DeviceReferenceModel[] = [];
  availableDevicesFormResult!: DeviceReferenceModel;
  availableDevices: DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;


  specificSensorData!: SensorsLiveDataFullDetailsModel[];
  transformedData!: TransformedData[];

  form!: FormGroup<SensorSelectionForm>;

  deviceId!: string;
  sensorId!: string;

  selectedSensor!: string;
  selectedDevice!: string;

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


  ngOnInit() {
    this.isLoading.set(false);
    const routeData = this.activatedRoute.snapshot.data;
    this.availableSensors = (routeData['availableSensors'] as ApiResult<SensorReferenceModel[]>).value!;
    this.availableSensorsResults = this.availableSensors
    this.availableSensorsOptions$ = this.sensorRepresentingService.getOptions(this.availableSensorsResults);
    this.availableDevices = (routeData['availableDevices'] as ApiResult<DeviceReferenceModel[]>).value!;
    this.availableDevices.unshift(new DeviceReferenceModel({id: -1, name: 'ALL (Average)', nickname: ''}));
    this.availableDevicesResults = this.availableDevices
    this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);

    this.form = this.buildCreateForm();

    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe((params: Params) => {
        this.sensorId = params['sensorId'];
        this.deviceId = params['deviceId'];
        if (!isNaN(Number(this.sensorId ))) {
          this.availableSensorsFormResult = this.availableSensors.find(as => as.id === Number(this.sensorId))!;
        }
        if (!isNaN(Number(this.deviceId))) {
          this.availableDevicesFormResult = this.availableDevices.find(ad => ad.id === Number(this.deviceId))!;
        }

        this.selectedDevice = this.availableDevices.find(d => d.id == (
          this.deviceId != "all" ? Number(this.deviceId) : -1))?.name!

        this.selectedSensor = this.availableSensors.find(d =>
          d.id == Number(this.sensorId))?.name!
        // Start polling
        if (!isNaN(Number(this.sensorId )) && (!isNaN(Number(this.deviceId)) || "all" )) {
          this.firstTime.set(false)
          this.fetchData(this.sensorId, true, this.deviceId ? this.deviceId!.toString() : "all");
        }
        else {
          this.firstTime.set(true)
        }
      });

  }

  submitForm() {
    if (this.form.controls.sensor.value?.id !== undefined
      && this.form.controls.device.value?.id !== undefined) {

      let sensorId!: string;
      let deviceId!: string;

      if (this.form.controls.sensor.value.id != -1) {
        sensorId = this.form.controls.sensor.value.id.toString();
      }

      if (this.form.controls.device.value.id != -1) {
        deviceId = this.form.controls.device.value.id.toString();
      } else {
        deviceId = 'all'
      }

      this.router.navigate([{ ['sensorId']: sensorId,
        ['deviceId']: deviceId,}], {
        relativeTo: this.activatedRoute,
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

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData(sensorId:  string | null, isFirstLoad: boolean = false, deviceId: string | null) {
    if (isFirstLoad) {
      this.isLoading.set(true);
      this.cd.markForCheck(); // Ensure UI updates for loading state
    }

    this.hasError.set(false);


    this.sensorDeviceDatasClient.getForSensor(sensorId!, deviceId!).pipe(
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
      this.startPolling(sensorId, deviceId);
    });
  }

  private startPolling(sensorId:string|null, deviceId: string | null) {
    this.stopPolling();

    this.pollingSubscription = interval(60000).pipe(
      switchMap(() =>
        this.sensorDeviceDatasClient.getForSensor(sensorId!, deviceId!)
          .pipe(
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
    this.fetchData(this.sensorId, true, this.deviceId ? this.deviceId!.toString() : "all");
  }


  protected readonly getDashboardMeasurementTypeText = getDashboardMeasurementTypeText;
}
