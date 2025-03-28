import {Component, Injectable, OnInit} from '@angular/core';
import {ManageComponentMode} from "../../../@shared/utils/manage-component-mode.enum";
import {ActivatedRoute, Router} from "@angular/router";
import {ApiResult} from "../../../@shared/utils/api-result";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {SubmittableFormDisabler} from "../../../@shared/submittable-form/submittable-form-disabler";
import {CrudHelpersService} from "../../../@shared/utils/crud-helpers.service";
import {BehaviorSubject, Observable, of} from "rxjs";
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

import {DevicesClient, DeviceCreateModel, DeviceUpdateModel} from "../../../@core/app-api";
import {DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {InputTextModule} from "primeng/inputtext";
import {InputNumberModule} from "primeng/inputnumber";
import {CalendarModule} from "primeng/calendar";
import {emptyStringToNull} from "../../../@shared/utils/string.helpers";

interface DeviceCreateForm {
  name: FormControl<string>;
  nickname: FormControl<string>;
  description: FormControl<string>;
  model: FormControl<string>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  installedDate: FormControl<Date | null>;
  uid: FormControl<string>;
}

interface DeviceUpdateForm {
  name: FormControl<string>;
  nickname: FormControl<string>;
  description: FormControl<string>;
  model: FormControl<string>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  installedDate: FormControl<Date | null>;
  uid: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './manage-device.component.html',
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
    InputTextModule,
    InputNumberModule,
    CalendarModule,
  ],
})
export class ManageDeviceComponent implements OnInit {
  // Info from route
  manageMode!: ManageComponentMode;
  itemId?: number;

  // Internal component state
  form!: FormGroup<DeviceCreateForm> | FormGroup<DeviceUpdateForm>;
  formDisabler!: SubmittableFormDisabler;

  // Page title
  private editItemTitleSubject = new BehaviorSubject<string | undefined>(undefined);
  public editItemTitle$ = this.editItemTitleSubject.asObservable();

  // The top right menu
  protected panelMenu!: Readonly<MenuItem[]>;

  constructor(
    public readonly activeRoute: ActivatedRoute,
    private readonly devicesClient: DevicesClient,
    private readonly crudHelpers: CrudHelpersService,
    private readonly router: Router,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly representingService: DeviceRepresentingService,
  ) {
  }

  ngOnInit(): void {
    const routeData = this.activeRoute.snapshot.data;

    if (routeData.hasOwnProperty('item')) {
      this.itemId = +this.activeRoute.snapshot.paramMap.get('id')!;
      this.manageMode = ManageComponentMode.Edit;

      const itemResult: ApiResult<DeviceUpdateModel> = routeData['item'];
      const item = itemResult.value!;

      const form = this.form = this.buildUpdateForm();
      form.setValue({
        name: item.name,
        nickname: item.nickname ?? '',
        description: item.description ?? '',
        model: item.model ?? '',
        latitude: item.latitude,
        longitude: item.longitude,
        installedDate: item.installedDate,
        uid: item.uid ?? '',
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
    const form = <FormGroup<DeviceCreateForm>>this.form;

    const model = new DeviceCreateModel({
      name: form.controls.name.value,
      nickname: emptyStringToNull(form.controls.nickname.value),
      description: emptyStringToNull(form.controls.description.value),
      model: emptyStringToNull(form.controls.model.value),
      latitude: form.controls.latitude.value!,
      longitude: form.controls.longitude.value!,
      installedDate: form.controls.installedDate.value!,
      uid: emptyStringToNull(form.controls.uid.value),
    });

    this.devicesClient.create(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(
          this.representingService
            .getLabel({
              name: form.controls.name.value,
              nickname: emptyStringToNull(form.controls.nickname.value),
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
    const form = <FormGroup<DeviceUpdateForm>>this.form;

    const model = new DeviceUpdateModel({
      name: form.controls.name.value,
      nickname: emptyStringToNull(form.controls.nickname.value),
      description: emptyStringToNull(form.controls.description.value),
      model: emptyStringToNull(form.controls.model.value),
      latitude: form.controls.latitude.value!,
      longitude: form.controls.longitude.value!,
      installedDate: form.controls.installedDate.value!,
      uid: emptyStringToNull(form.controls.uid.value),
    });

    this.devicesClient.update(this.itemId!, model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(
          this.representingService
            .getLabel({
              name: form.controls.name.value,
              nickname: emptyStringToNull(form.controls.nickname.value),
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
    const form = <FormGroup<DeviceUpdateForm>>this.form;

    this.editItemTitleSubject.next(
      this.representingService
        .getLabel({
          name: form.controls.name.value,
          nickname: emptyStringToNull(form.controls.nickname.value),
        })
        .value,
    );
  }

  private buildCreateForm(): FormGroup<DeviceCreateForm> {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.required(),
          CommonValidators.maxLength({value: 500}),
        ],
      }),
      nickname: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 500}),
        ],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 500}),
        ],
      }),
      model: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 250}),
        ],
      }),
      latitude: new FormControl<number | null>(null),
      longitude: new FormControl<number | null>(null),
      installedDate: new FormControl<Date | null>(null),
      uid: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 250}),
        ],
        asyncValidators: [
          CommonValidators.commonUniqueValidator(abstractControl => {
            const control = abstractControl as FormControl<string>;
            const value = emptyStringToNull(control.value);

            if (value === null || value === undefined) return of(null);

            return this.devicesClient.checkUniqueUid(this.itemId, value);
          }),
        ],
      }),
    });
  }

  private buildUpdateForm(): FormGroup<DeviceUpdateForm> {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.required(),
          CommonValidators.maxLength({value: 500}),
        ],
      }),
      nickname: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 500}),
        ],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 500}),
        ],
      }),
      model: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 250}),
        ],
      }),
      latitude: new FormControl<number | null>(null),
      longitude: new FormControl<number | null>(null),
      installedDate: new FormControl<Date | null>(null),
      uid: new FormControl('', {
        nonNullable: true,
        validators: [
          CommonValidators.maxLength({value: 250}),
        ],
        asyncValidators: [
          CommonValidators.commonUniqueValidator(abstractControl => {
            const control = abstractControl as FormControl<string>;
            const value = emptyStringToNull(control.value);

            if (value === null || value === undefined) return of(null);

            return this.devicesClient.checkUniqueUid(this.itemId, value);
          }),
        ],
      }),
    });
  }
}

@Injectable()
export class EditDeviceTitleProvider extends EditItemTitleProvider<ManageDeviceComponent> {
  getItemName$(component: ManageDeviceComponent): Observable<string | undefined> {
    return component.editItemTitle$;
  }
}
