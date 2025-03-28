import {Component} from '@angular/core';
import {buildManageDashboardForm} from "../form/manage-dashboard.form";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {SubmittableFormDisabler} from "../../../../../@shared/submittable-form/submittable-form-disabler";
import {ConfigurableDashboardClient, ConfigurableDashboardCreateModel} from "../../../../../@core/app-api";
import {CrudHelpersService} from "../../../../../@shared/utils/crud-helpers.service";
import {ManageComponentMode} from "../../../../../@shared/utils/manage-component-mode.enum";
import {ManageDashboardFormComponent} from "../form/manage-dashboard-form.component";
import {TranslocoModule} from "@ngneat/transloco";
import {ButtonModule} from "primeng/button";

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    ManageDashboardFormComponent,
    TranslocoModule,
    ButtonModule,
  ],
  templateUrl: './create-dashboard.component.html',
})
export class CreateDashboardComponent {
  public static readonly dialogConfig: Partial<DynamicDialogConfig> = {
    closable: false,
    closeOnEscape: false,
  };

  readonly form = buildManageDashboardForm();
  readonly formDisabler = new SubmittableFormDisabler(this.form);

  constructor(
    private readonly dialogRef: DynamicDialogRef,
    private readonly dashboardClient: ConfigurableDashboardClient,
    private readonly crudHelpers: CrudHelpersService,
  ) {
  }

  onReject(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const model = new ConfigurableDashboardCreateModel({
      name: this.form.controls.name.value,
    });

    this.dashboardClient.create(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.crudHelpers.handleManageToasts(this.form.controls.name.value, ManageComponentMode.Add),
        untilDestroyed(this),
      )
      .subscribe(dashboardId => {
        // TODO: not actually needed once the reuse is implemented
        this.form.markAsPristine();

        this.dialogRef.close(dashboardId);
      });
  }
}
