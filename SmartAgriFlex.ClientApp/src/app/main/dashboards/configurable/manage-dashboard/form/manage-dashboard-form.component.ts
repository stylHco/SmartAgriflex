import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ManageDashboardForm} from "./manage-dashboard.form";
import {ActivatedRoute} from "@angular/router";
import {IdNamespaceModule} from "../../../../../@shared/id-namespace/id-namespace.module";
import {FormLossPreventionModule} from "../../../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {
  RequiredFieldIndicatorModule
} from "../../../../../@shared/required-field-indicator/required-field-indicator.module";
import {FormControlErrorsModule} from "../../../../../@shared/form-control-errors/form-control-errors.module";
import {InputTextModule} from "primeng/inputtext";

@Component({
  selector: 'app-manage-dashboard-form',
  standalone: true,
  imports: [
    IdNamespaceModule,
    ReactiveFormsModule,
    FormLossPreventionModule,
    RequiredFieldIndicatorModule,
    FormControlErrorsModule,
    InputTextModule,
  ],
  templateUrl: './manage-dashboard-form.component.html',
})
export class ManageDashboardFormComponent {
  @Input()
  public form!: FormGroup<ManageDashboardForm>;

  @Output()
  public onSubmit = new EventEmitter<void>();

  constructor(
    readonly activatedRoute: ActivatedRoute,
  ) {
  }
}
