import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterModule} from "@angular/router";
import {
  DeviceReferenceModel, DevicesClient, DevicesListModel
} from "../../../@core/app-api";
import {ApiResult} from "../../../@shared/utils/api-result";
import {CommonModule} from "@angular/common";
import {LineChartComponent} from "../../charts/line-chart.component";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import { Observable, Subscription} from "rxjs";
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
import {RippleModule} from "primeng/ripple";
import {DeviceOption, DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";


interface DeviceSelectionForm {
  device: FormControl<DeviceReferenceModel | null>;
}

@Component({
  selector: 'app-view-device-location',
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
    RippleModule,
  ],
  templateUrl: './view-sensor-location.component.html',
  styleUrl: './view-sensor-location.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSensorLocationComponent implements OnInit {
  availableDevicesResults:  DeviceReferenceModel[] = [];
  availableDevices:  DeviceReferenceModel[] = [];
  availableDevicesOptions$!: Observable<DeviceOption< DeviceReferenceModel>[]>;

  deviceInfo!: DevicesListModel;


  form!: FormGroup<DeviceSelectionForm>;


  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private deviceRepresentingService:  DeviceRepresentingService,
    private deviceClient:  DevicesClient
  ) {
  }


  ngOnInit() {
    const routeData = this.activatedRoute.snapshot.data;

    this.availableDevices = (routeData['availableDevices'] as ApiResult<DeviceReferenceModel[]>).value!;

    this.availableDevicesResults = this.availableDevices
    this.availableDevicesOptions$ = this.deviceRepresentingService.getOptions(this.availableDevicesResults);


    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd),
      )
      .subscribe((params: Params) => {
        const deviceId = +params['deviceId'];
        if (!isNaN(deviceId)) {
          this.deviceClient.get(deviceId)
            .pipe(
              autoMarkForCheck(this.cd),
            )
            .subscribe(
            value => {
              this.deviceInfo = value;
            }
          )
        }
      });


    this.form = this.buildCreateForm();


  }

  submitForm() {

    let deviceId: number = this.form.controls.device.value?.id ?? /* default value or action */ 0;

    if (this.form.controls.device.value?.id !== undefined) {
      let deviceId: number = this.form.controls.device.value.id;

      this.ngZone.run(() => {
        this.router.navigate([{deviceId: deviceId}], {relativeTo: this.activatedRoute});
      });
    } else {
      console.error("device id is undefined!!");
    }

    this.form.reset();

  }

  private buildCreateForm(): FormGroup< DeviceSelectionForm> {
    return new FormGroup({
      device: new FormControl< DeviceReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }
  openLinkInNewTab(): void {
    const url = `https://www.google.com/maps/place/${this.deviceInfo.latitude},${this.deviceInfo.longitude}` ;
    window.open(url, '_blank');
  }

}
