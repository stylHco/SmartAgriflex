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
  CustomRulesClient,
  CustomRuleCreateModel,
  CustomRuleUpdateModel,
  SensorReferenceModel,
  DeviceReferenceModel,
} from "../../../@core/app-api";
import {SensorOption, SensorRepresentingService} from "../../../@core/sensors/sensor-representing.utils";
import {DeviceOption, DeviceRepresentingService} from "../../../@core/devices/device-representing.utils";
import {DropdownModule} from "primeng/dropdown";
import {DropdownDefaultsModule} from "../../../@shared/defaults/dropdown-defaults.module";
import {InputTextModule} from "primeng/inputtext";
import {emptyStringToNull} from "../../../@shared/utils/string.helpers";
import {CustomRuleRepresentingService} from "../../../@core/custom-rules/custom-rule-representing.utils";
import {InputNumberModule} from "primeng/inputnumber";

interface CustomRuleCreateForm {
  sensor: FormControl<SensorReferenceModel | null>;
  min: FormControl<number | null>;
  max: FormControl<number | null>;
  programDirective: FormControl<string | null>;
  ruleText: FormControl<string | null>;
}

interface CustomRuleUpdateForm {
  sensor: FormControl<SensorReferenceModel | null>;
  min: FormControl<number | null>;
  max: FormControl<number | null>;
  programDirective: FormControl<string | null>;
  ruleText: FormControl<string | null>;
}

@UntilDestroy()
@Component({
  templateUrl: './manage-custom-rule.component.html',
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
    InputNumberModule,
  ],
})
export class ManageCustomRuleComponent implements OnInit {
  // Info from route
  manageMode!: ManageComponentMode;
  itemId?: number;

  // FK dropdowns data
  sensors!: SensorReferenceModel[];

  // FK options
  sensorOptions$!: Observable<SensorOption<SensorReferenceModel>[]>;

  // Internal component state
  form!: FormGroup<CustomRuleCreateForm> | FormGroup<CustomRuleUpdateForm>;
  formDisabler!: SubmittableFormDisabler;

  // Page title
  private editItemTitleSubject = new BehaviorSubject<string | undefined>(undefined);
  public editItemTitle$ = this.editItemTitleSubject.asObservable();

  // The top right menu
  protected panelMenu!: Readonly<MenuItem[]>;

  constructor(
    public readonly activeRoute: ActivatedRoute,
    private readonly customRulesClient: CustomRulesClient,
    private readonly crudHelpers: CrudHelpersService,
    private readonly router: Router,
    private readonly menuTranslator: MenuTranslatorService,
    private readonly representingService: CustomRuleRepresentingService,
    private readonly sensorRepresentingService: SensorRepresentingService,
    private readonly deviceRepresentingService: DeviceRepresentingService,
  ) {
  }

  ngOnInit(): void {
    const routeData = this.activeRoute.snapshot.data;

    const sensorsResult: ApiResult<SensorReferenceModel[]> = routeData['sensors'];
    this.sensors = sensorsResult.value!;
    this.sensorOptions$ = this.sensorRepresentingService.getOptions(this.sensors);

    if (routeData.hasOwnProperty('item')) {
      this.itemId = +this.activeRoute.snapshot.paramMap.get('id')!;
      this.manageMode = ManageComponentMode.Edit;

      const itemResult: ApiResult<CustomRuleUpdateModel> = routeData['item'];
      const item = itemResult.value!;

      const form = this.form = this.buildUpdateForm();
      form.setValue({
        sensor: this.sensors.find(s => s.id === item.sensorId) ?? null,
        min: item.min ?? null,
        max: item.max ?? null,
        programDirective: item.programDirective ?? '',
        ruleText: item.ruleText ?? '',
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
    const form = <FormGroup<CustomRuleCreateForm>>this.form;

    const sensor = form.controls.sensor.value;
    const min = form.controls.min.value;
    const max = form.controls.max.value;
    const programDirective = form.controls.programDirective.value;
    const ruleText = form.controls.ruleText.value;

    const model = new CustomRuleCreateModel({
      sensorId: sensor!.id,
      min: min,
      max: max,
      programDirective: programDirective,
      ruleText: ruleText
    });

    this.customRulesClient.create(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(
          id => this.representingService
            .getLabel({
              id: id,
              sensor: sensor!,
              programDirective: programDirective,
              ruleText: ruleText
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
    const form = <FormGroup<CustomRuleUpdateForm>>this.form;

    const sensor = form.controls.sensor.value;
    const min = form.controls.min.value;
    const max = form.controls.max.value;
    const programDirective = form.controls.programDirective.value;
    const ruleText = form.controls.ruleText.value;

    const model = new CustomRuleUpdateModel({
      sensorId: sensor!.id,
      min: min,
      max: max,
      programDirective: programDirective,
      ruleText: ruleText
    });

    this.customRulesClient.update(this.itemId!, model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(
          this.representingService
            .getLabel({
              id: this.itemId!,
              sensor: sensor!,
              programDirective: programDirective,
              ruleText: ruleText
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
    const sensor = this.form.controls.sensor.value;
    const programDirective = this.form.controls.programDirective.value;
    const ruleText = this.form.controls.ruleText.value;

    this.editItemTitleSubject.next(
      this.representingService
        .getLabel({
          id: this.itemId!,
          sensor: sensor!,
          programDirective: programDirective,
          ruleText: ruleText
        })
        .value,
    );
  }

  private buildCreateForm(): FormGroup<CustomRuleCreateForm> {
    return new FormGroup({
      sensor: new FormControl<SensorReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
      min: new FormControl<number | null>(null, {
        validators: [
        ],
      }),
      max: new FormControl<number | null>(null, {
        validators: [
        ],
      }),
      programDirective: new FormControl<string | null>(null, {
        validators: [
          CommonValidators.maxLength({value: 100}),
          CommonValidators.required()
        ],
      }),
      ruleText: new FormControl<string | null>(null, {
        validators: [
          CommonValidators.maxLength({value: 450}),
          CommonValidators.required()
        ],
      }),
    });
  }

  private buildUpdateForm(): FormGroup<CustomRuleUpdateForm> {
    return new FormGroup({
      sensor: new FormControl<SensorReferenceModel | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
      min: new FormControl<number | null>(null, {
        validators: [
        ],
      }),
      max: new FormControl<number | null>(null, {
        validators: [
        ],
      }),
      programDirective: new FormControl<string | null>(null, {
        validators: [
          CommonValidators.maxLength({value: 100}),
          CommonValidators.required()
        ],
      }),
      ruleText: new FormControl<string | null>(null, {
        validators: [
          CommonValidators.maxLength({value: 450}),
          CommonValidators.required()
        ],
      }),
    });
  }
}

@Injectable()
export class EditCustomRuleTitleProvider extends EditItemTitleProvider<ManageCustomRuleComponent> {
  getItemName$(component: ManageCustomRuleComponent): Observable<string | undefined> {
    return component.editItemTitle$;
  }
}
