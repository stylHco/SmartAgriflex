import {Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {CommonValidators} from "../../@shared/utils/common-validators";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../@core/auth/auth.service";
import {CommonToastsService} from "../../@shared/common-toasts/common-toasts.service";
import {SubmittableFormDisabler} from "../../@shared/submittable-form/submittable-form-disabler";
import {RequestPasswordResetModel} from "../../@core/auth/request-password-reset.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {PredefinedToastsService} from "../../@shared/common-toasts/predefined-toasts.service";

interface RequestPasswordResetForm {
  email: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './request-password-reset.component.html',
})
export class RequestPasswordResetComponent {
  form: FormGroup<RequestPasswordResetForm> = buildForm();
  formDisabler = new SubmittableFormDisabler(this.form);

  constructor(
    readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly commonToasts: CommonToastsService,
    private readonly predefinedToasts: PredefinedToastsService,
  ) {
  }

  // TODO: loc the toasts
  submitForm(): void {
    const model = new RequestPasswordResetModel(this.form.getRawValue());

    this.authService.requestPasswordReset(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.predefinedToasts.internalErrorRxMonitor(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.form.markAsPristine();
        this.commonToasts.showBasicSuccess({
          summary: 'Email sent',
          detail: 'Check your email',
          life: 4000,
        });
      });
  }
}

function buildForm(): FormGroup<RequestPasswordResetForm> {
  return new FormGroup<RequestPasswordResetForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        CommonValidators.email(),
      ],
    }),
  });
}
