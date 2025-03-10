import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterModule} from "@angular/router";
import {
  DeviceReferenceModel, SensorDateStatistics, SensorDeviceDatasClient, SensorDeviceDatasListModel,
  SensorReferenceModel,
  SensorsListModel
} from "../../../@core/app-api";
import {ApiResult} from "../../../@shared/utils/api-result";
import {
  EChartAvailableData,
  transformData,
  transformDataForSpecificSensors,
  TransformedData
} from "../../charts/transformation-of-data";
import {CommonModule} from "@angular/common";
import {LineChartComponent} from "../../charts/line-chart.component";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SensorOption, SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {Observable, of} from "rxjs";
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
import {DeviceOption, DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {MultiSelectModule} from "primeng/multiselect";

interface SensorSelectionForm {
  sensor: FormControl<SensorReferenceModel[] | null>;
  device: FormControl<DeviceReferenceModel[] | null>;
}

interface SeriesSelectionForm {
  series: FormControl<EChartAvailableData[]>;
}

@Component({
  selector: 'app-view-history-charts',
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
    MultiSelectModule,
    FormsModule,
  ],
  templateUrl: './view-history-charts.component.html',
  styleUrl: './view-history-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewHistoryChartsComponent implements OnInit {
  availableSensorsResults: SensorReferenceModel[] = [];
  availableSensorsFormResult!: SensorReferenceModel;
  availableSensors: SensorReferenceModel[] = [];
  availableSensorsOptions$!: Observable<SensorOption<SensorReferenceModel>[]>;

  availableDevicesResults: DeviceReferenceModel[] = [];
  availableDevicesFormResult!: DeviceReferenceModel;
  availableDevices: DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;


  sensorsFullData: SensorDeviceDatasListModel[] = [];

  specificSensorData!: { [p: string]: SensorDateStatistics[] };
  transformedData!: TransformedData[];
  sensorInfo: SensorsListModel[] = [];
  form!: FormGroup<SensorSelectionForm>;


  selectSeriesForm!: FormGroup<SeriesSelectionForm>;
  selectSeriesOptions$:  { label: string, value: EChartAvailableData }[] = [];
  selectedSeries!:EChartAvailableData[];

  sensorId!: string | null;
  deviceId!: string | null;

  showChart = false;
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

    this.selectSeriesOptions$ = Object.keys(EChartAvailableData).map(key => ({
      label: EChartAvailableData[key as keyof typeof EChartAvailableData],
      value: EChartAvailableData[key as keyof typeof EChartAvailableData]
    }));


    const routeData = this.activatedRoute.snapshot.data;

    this.sensorInfo = (routeData['sensorInfo'] as ApiResult<SensorsListModel[]>).value!;

    this.availableSensors = (routeData['availableSensors'] as ApiResult<SensorReferenceModel[]>).value!;

    this.availableSensorsResults = this.availableSensors
    this.availableSensorsOptions$ = this.sensorRepresentingService.getOptions(this.availableSensorsResults);

    this.availableDevices = (routeData['availableDevices'] as ApiResult<DeviceReferenceModel[]>).value!;

    this.availableDevicesResults = this.availableDevices
    this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);

    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe((params: Params) => {
        this.sensorId = params['sensorIds'];
        this.deviceId = params['deviceIds'];


        this.sensorDeviceDatasClient.getSensor(this.sensorId!, this.deviceId!)
          .pipe(
            autoMarkForCheck(this.cd),
          )
          .subscribe(
            data => {
              this.showChart = true
              this.specificSensorData = data;
              this.transformedData = transformDataForSpecificSensors(this.specificSensorData, [EChartAvailableData.value]);
              console.log(this.transformedData)
            }
          )

      });

    this.form = this.buildCreateForm();
    this.selectSeriesForm = this.buildCreateSelectSeriesForm()

    // Subscribe to value changes
    this.selectSeriesForm.controls.series.valueChanges.subscribe((changedValues) => {
      this.handleSeriesChange(changedValues);
    });

  }

  submitForm() {
    if (this.form.controls.sensor.value !== undefined
      && this.form.controls.device.value !== undefined) {

      let sensorId!: string | null;
      let deviceId!: string | null;

      this.form.controls.sensor.value!.forEach((sensor, i) => {
          if(i == 0){
            sensorId = sensor.id.toString();
          }
          else{
            sensorId += ',' + sensor.id.toString();
          }
      });

      this.form.controls.device.value!.forEach((device, i) => {
          if(i == 0){
            deviceId = device.id.toString();
          }
          else{
            deviceId += ',' + device.id.toString();
          }
      });

      this.ngZone.run(() => {
        this.router.navigate([{sensorIds: sensorId, deviceIds: deviceId}], {relativeTo: this.activatedRoute});
      });
    } else {
      console.error("Sensor id is undefined!!");
    }

    this.form.reset();

  }

  private buildCreateForm(): FormGroup<SensorSelectionForm> {
    return new FormGroup({
      sensor: new FormControl<SensorReferenceModel[] | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
      device: new FormControl<DeviceReferenceModel[] | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }

  private buildCreateSelectSeriesForm(): FormGroup<SeriesSelectionForm> {
    return new FormGroup({
      series: new FormControl<EChartAvailableData[]>([], {
        nonNullable: true,
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }

  private handleSeriesChange(selectedSeries: any[]) {
    // Check the type of `selectedSeries` to determine if it's an array of objects
    if (selectedSeries.length > 0 && typeof selectedSeries[0] === 'object') {
      // Extract values if they are objects
      const selectedValues = selectedSeries.map(item => item.value);
      console.log('Extracted values:', selectedValues);

      // Proceed with the transformed data
      if (this.sensorId !== null && this.deviceId !== null) {
        this.sensorDeviceDatasClient.getSensor(this.sensorId, this.deviceId)
          .pipe(autoMarkForCheck(this.cd))
          .subscribe(data => {
            this.specificSensorData = data;
            this.transformedData = transformDataForSpecificSensors(this.specificSensorData, selectedValues);
          });
      }
    } else {
      // Handle cases where the values are directly of type `EChartAvailableData`
      console.log('Selected values:', selectedSeries);
      if (this.sensorId !== null && this.deviceId !== null) {
        this.sensorDeviceDatasClient.getSensor(this.sensorId, this.deviceId)
          .pipe(autoMarkForCheck(this.cd))
          .subscribe(data => {
            this.specificSensorData = data;
            this.transformedData = transformDataForSpecificSensors(this.specificSensorData, selectedSeries);
          });
      }
    }
  }

}
