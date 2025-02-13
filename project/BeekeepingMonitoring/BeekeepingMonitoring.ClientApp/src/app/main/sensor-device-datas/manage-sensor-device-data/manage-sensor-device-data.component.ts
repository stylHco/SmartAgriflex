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
import {localDateToNative, nativeToLocalDate} from "../../../@shared/date-time/joda.helpers";

import {
  SensorDeviceDatasClient,
  SensorDeviceDataCreateModel,
  SensorDeviceDataUpdateModel,
  SensorDeviceReferenceModel,
} from "../../../@core/app-api";
import {
  SensorDeviceDataRepresentingService,
} from "../../../@core/sensor-device-datas/sensor-device-data-representing.utils";
import {
  SensorDeviceOption,
  SensorDeviceRepresentingService,
} from "../../../@core/sensor-devices/sensor-device-representing.utils";
import {DropdownModule} from "primeng/dropdown";
import {DropdownDefaultsModule} from "../../../@shared/defaults/dropdown-defaults.module";
import {InputNumberModule} from "primeng/inputnumber";
import {CalendarModule} from "primeng/calendar";
import {OffsetDateTime} from "@js-joda/core";

interface SensorDeviceDataCreateForm {
  sensorDevice: FormControl<SensorDeviceReferenceModel | null>;
  value: FormControl<number | null>;
  recordDate: FormControl<Date | null>;
}

interface SensorDeviceDataUpdateForm {
  sensorDevice: FormControl<SensorDeviceReferenceModel | null>;
  value: FormControl<number | null>;
  recordDate: FormControl<Date | null>;
}

@UntilDestroy()
@Component({
  templateUrl: './manage-sensor-device-data.component.html',
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
    InputNumberModule,
    CalendarModule,
  ],
})
export class ManageSensorDeviceDataComponent implements OnInit {
  // Info from route
  manageMode!: ManageComponentMode;
  itemId?: number;

  // FK dropdowns data
  sensorDevices!: SensorDeviceReferenceModel[];

  // FK options
  sensorDeviceOptions$!: Observable<SensorDeviceOption<SensorDeviceReferenceModel>[]>;

  // Internal component state
  form!: FormGroup<SensorDeviceDataCreateForm> | FormGroup<SensorDeviceDataUpdateForm>;
  formDisabler!: SubmittableFormDisabler;

  // Page title
  private editItemTitleSubject = new BehaviorSubject<string | undefined>(undefined);
  public editItemTitle$ = this.editItemTitleSubject.asObservable();

  // The top right menu
  protected panelMenu!: Readonly<MenuItem[]>;

  constructor(
    public readonly activeRoute: ActivatedRoute,
    private readonly sensorDeviceDatasClient: SensorDeviceDatasClient,
    private readonly crudHelpers: CrudHelpersService,
    private readonly router: Router,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly representingService: SensorDeviceDataRepresentingService,
    private readonly sensorDeviceRepresentingService: SensorDeviceRepresentingService,
  ) {
  }

  ngOnInit(): void {
    const routeData = this.activeRoute.snapshot.data;

    const sensorDevicesResult: ApiResult<SensorDeviceReferenceModel[]> = routeData['sensorDevices'];
    this.sensorDevices = sensorDevicesResult.value!;
    this.sensorDeviceOptions$ = this.sensorDeviceRepresentingService.getOptions(this.sensorDevices);

    if (routeData.hasOwnProperty('item')) {
      this.itemId = +this.activeRoute.snapshot.paramMap.get('id')!;
      this.manageMode = ManageComponentMode.Edit;

      const itemResult: ApiResult<SensorDeviceDataUpdateModel> = routeData['item'];
      const item = itemResult.value!;

      const form = this.form = this.buildUpdateForm();
      form.setValue({
        sensorDevice: this.sensorDevices.find(s => s.id === item.sensorDeviceId) ?? null,
        value: item.value,
        recordDate: item.recordDate!,
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
    const form = <FormGroup<SensorDeviceDataCreateForm>>this.form;

    const sensorDevice = form.controls.sensorDevice.value;

    const model = new SensorDeviceDataCreateModel({
      sensorDeviceId: sensorDevice!.id,
      value: form.controls.value.value!,
      recordDate: form.controls.recordDate.value!,
    });

    this.sensorDeviceDatasClient.create(model)
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
    const form = <FormGroup<SensorDeviceDataUpdateForm>>this.form;

    const sensorDevice = form.controls.sensorDevice.value;

    const model = new SensorDeviceDataUpdateModel({
      sensorDeviceId: sensorDevice!.id,
      value: form.controls.value.value!,
      recordDate: form.controls.recordDate.value!,
    });

    this.sensorDeviceDatasClient.update(this.itemId!, model)
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

  private buildCreateForm(): FormGroup<SensorDeviceDataCreateForm> {
    return new FormGroup({
      sensorDevice: new FormControl<SensorDeviceReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
      value: new FormControl<number | null>(null),
      recordDate: new FormControl<Date | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }

  private buildUpdateForm(): FormGroup<SensorDeviceDataUpdateForm> {
    return new FormGroup({
      sensorDevice: new FormControl<SensorDeviceReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
      value: new FormControl<number | null>(null),
      recordDate: new FormControl<Date | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    });
  }
}

@Injectable()
export class EditSensorDeviceDataTitleProvider extends EditItemTitleProvider<ManageSensorDeviceDataComponent> {
  getItemName$(component: ManageSensorDeviceDataComponent): Observable<string | undefined> {
    return component.editItemTitle$;
  }
}
