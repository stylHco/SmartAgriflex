import {Component, Injectable, OnInit} from '@angular/core';
import {ManageComponentMode} from "../../../@shared/utils/manage-component-mode.enum";
import {ActivatedRoute, Router} from "@angular/router";
import {ApiResult} from "../../../@shared/utils/api-result";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {SubmittableFormDisabler} from "../../../@shared/submittable-form/submittable-form-disabler";
import {CrudHelpersService} from "../../../@shared/utils/crud-helpers.service";
import {BehaviorSubject, Observable} from "rxjs";
import {EditItemTitleProvider} from "../../../@shared/page-title/common-title-providers";
import {CommonModule} from "@angular/common";
import {TranslocoModule} from "@ngneat/transloco";
import {FormControlErrorsModule} from "../../../@shared/form-control-errors/form-control-errors.module";
import {IdNamespaceModule} from "../../../@shared/id-namespace/id-namespace.module";
import {PanelModule} from "primeng/panel";
import {ButtonModule} from "primeng/button";
import {BlockUIModule} from "primeng/blockui";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {FormLossPreventionModule} from "../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {MenuItem} from "primeng/api";
import {MenuTitleTranslation, MenuTranslatorService} from "../../../@shared/dynamic-menu/translated-menu";
import {DynamicMenuPipe} from "../../../@shared/dynamic-menu/dynamic-menu.pipe";
import {PanelHeaderActionsComponent} from "../../../@shared/panel-header-actions/panel-header-actions.component";
import {RequiredFieldIndicatorModule} from "../../../@shared/required-field-indicator/required-field-indicator.module";
import {CommonValidators} from "../../../@shared/utils/common-validators";

import {
  SensorDevicesClient,
  SensorDeviceCreateModel,
  SensorDeviceUpdateModel,
  SensorReferenceModel,
  DeviceReferenceModel,
} from "../../../@core/app-api";
import {SensorDeviceRepresentingService} from "../../../@core/sensor-devices/sensor-device-representing.utils";
import {SensorOption, SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {DeviceOption, DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {DropdownModule} from "primeng/dropdown";
import {DropdownDefaultsModule} from "../../../@shared/defaults/dropdown-defaults.module";
import {InputTextModule} from "primeng/inputtext";
import {emptyStringToNull} from "../../../@shared/utils/string.helpers";

interface SensorDeviceCreateForm {
  sensor: FormControl<SensorReferenceModel | null>;
  device: FormControl<DeviceReferenceModel | null>;
  comments: FormControl<string>;
}

interface SensorDeviceUpdateForm {
  sensor: FormControl<SensorReferenceModel | null>;
  device: FormControl<DeviceReferenceModel | null>;
  comments: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './manage-sensor-device.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,

    ReactiveFormsModule,
    FormControlErrorsModule,
    IdNamespaceModule,
    PanelModule,
    PanelHeaderActionsComponent,
    DynamicMenuPipe,
    ButtonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    FormLossPreventionModule,
    RequiredFieldIndicatorModule,
    DropdownModule,
    DropdownDefaultsModule,
    InputTextModule,
  ],
})
export class ManageSensorDeviceComponent implements OnInit {
  // Info from route
  manageMode!: ManageComponentMode;
  itemId?: number;

  // FK dropdowns data
  sensors!: SensorReferenceModel[];
  devices!: DeviceReferenceModel[];

  // FK options
  sensorOptions$!: Observable<SensorOption<SensorReferenceModel>[]>;
  deviceOptions$!: Observable<DeviceOption<DeviceReferenceModel>[]>;

  // Internal component state
  form!: FormGroup<SensorDeviceCreateForm> | FormGroup<SensorDeviceUpdateForm>;
  formDisabler!: SubmittableFormDisabler;

  // Page title
  private editItemTitleSubject = new BehaviorSubject<string | undefined>(undefined);
  public editItemTitle$ = this.editItemTitleSubject.asObservable();

  // The top right menu
  protected panelMenu!: Readonly<MenuItem[]>;

  constructor(
    public readonly activeRoute: ActivatedRoute,
    private readonly sensorDevicesClient: SensorDevicesClient,
    private readonly crudHelpers: CrudHelpersService,
    private readonly router: Router,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly representingService: SensorDeviceRepresentingService,
    private readonly sensorRepresentingService: SensorRepresentingService,
    private readonly deviceRepresentingService: DeviceRepresentingService,
  ) {
  }

  ngOnInit(): void {
    const routeData = this.activeRoute.snapshot.data;

    const sensorsResult: ApiResult<SensorReferenceModel[]> = routeData['sensors'];
    this.sensors = sensorsResult.value!;
    this.sensorOptions$ = this.sensorRepresentingService.getOptions(this.sensors);

    const devicesResult: ApiResult<DeviceReferenceModel[]> = routeData['devices'];
    this.devices = devicesResult.value!;
    this.deviceOptions$ = this.deviceRepresentingService.getOptions(this.devices);

    if (routeData.hasOwnProperty('item')) {
      this.itemId = +this.activeRoute.snapshot.paramMap.get('id')!;
      this.manageMode = ManageComponentMode.Edit;

      const itemResult: ApiResult<SensorDeviceUpdateModel> = routeData['item'];
      const item = itemResult.value!;

      const form = this.form = this.buildUpdateForm();
      form.setValue({
        sensor: this.sensors.find(s => s.id === item.sensorId) ?? null,
        device: this.devices.find(d => d.id === item.deviceId) ?? null,
        comments: item.comments ?? '',
      });

      this.updateEditItemTitle();

      this.panelMenu = [
        {
          icon: 'pi pi-search',
          [MenuTitleTranslation]: {key: 'buttons.viewDetails'},
          routerLink: ['../../view/', this.itemId],
        },
        {separator: true},
        {
          icon: 'pi pi-plus',
          [MenuTitleTranslation]: {key: 'buttons.create'},
          routerLink: '../../add',
        },
        {
          icon: 'pi pi-list',
          [MenuTitleTranslation]: {key: 'buttons.listAll'},
          routerLink: '../../',
        },
      ];
    } else {
      this.manageMode = ManageComponentMode.Add;
      this.form = this.buildCreateForm();

      this.panelMenu = [
        {
          icon: 'pi pi-list',
          [MenuTitleTranslation]: {key: 'buttons.listAll'},
          routerLink: '../',
        },
      ];
    }

    this.formDisabler = new SubmittableFormDisabler(this.form);

    this.menuTranslator.translateAllMenuItems(this.panelMenu, {
      pipe: untilDestroyed(this),
    });
  }

  submitForm() {
    if (this.manageMode == ManageComponentMode.Add) this.addItem();
    else this.updateItem();
  }

  private addItem(): void {
    const form = <FormGroup<SensorDeviceCreateForm>>this.form;

    const sensor = form.controls.sensor.value;
    const device = form.controls.device.value;

    const model = new SensorDeviceCreateModel({
      sensorId: sensor!.id,
      deviceId: device!.id,
      comments: emptyStringToNull(form.controls.comments.value),
    });

    this.sensorDevicesClient.create(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(
          id => this.representingService
            .getLabel({
              id: id,
            })
            .value,
          this.manageMode,
        ),
        untilDestroyed(this),
      )
      .subscribe(id => {
        this.form.markAsPristine();
        this.router.navigate(['../view/', id], {relativeTo: this.activeRoute});
      });
  }

  private updateItem(): void {
    const form = <FormGroup<SensorDeviceUpdateForm>>this.form;

    const sensor = form.controls.sensor.value;
    const device = form.controls.device.value;

    const model = new SensorDeviceUpdateModel({
      sensorId: sensor!.id,
      deviceId: device!.id,
      comments: emptyStringToNull(form.controls.comments.value),
    });

    this.sensorDevicesClient.update(this.itemId!, model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(
          this.representingService
            .getLabel({
              id: this.itemId!,
            })
            .value,
          this.manageMode,
        ),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.form.markAsPristine();
        this.updateEditItemTitle();
      });
  }

  private updateEditItemTitle() {
    this.editItemTitleSubject.next(
      this.representingService
        .getLabel({
          id: this.itemId!,
        })
        .value,
    );
  }

  private buildCreateForm(): FormGroup<SensorDeviceCreateForm> {
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
      comments: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 250}),
        ],
      }),
    });
  }

  private buildUpdateForm(): FormGroup<SensorDeviceUpdateForm> {
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
      comments: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 250}),
        ],
      }),
    });
  }
}

@Injectable()
export class EditSensorDeviceTitleProvider extends EditItemTitleProvider<ManageSensorDeviceComponent> {
  getItemName$(component: ManageSensorDeviceComponent): Observable<string | undefined> {
    return component.editItemTitle$;
  }
}
