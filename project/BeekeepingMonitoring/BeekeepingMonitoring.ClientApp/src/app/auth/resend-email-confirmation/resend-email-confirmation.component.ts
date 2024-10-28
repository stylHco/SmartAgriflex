import {Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {SubmittableFormDisabler} from "../../@shared/submittable-form/submittable-form-disabler";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../@core/auth/auth.service";
import {CommonToastsService} from "../../@shared/common-toasts/common-toasts.service";
import {CommonValidators} from "../../@shared/utils/common-validators";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {PredefinedToastsService} from "../../@shared/common-toasts/predefined-toasts.service";
import {ResendEmailConfirmationModel} from "../../@core/auth/resend-email-confirmation.model";

interface ResendEmailConfirmationForm {
  email: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './resend-email-confirmation.component.html',
})
export class ResendEmailConfirmationComponent {
  form: FormGroup<ResendEmailConfirmationForm> = buildForm();
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
    const model = new ResendEmailConfirmationModel(this.form.getRawValue());

    this.authService.resendEmailConfirmation(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.predefinedToasts.internalErrorRxMonitor(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.form.markAsPristine();
        this.commonToasts.showBasicSuccess({
          summary: 'Confirmation sent',
          detail: 'Check your email',
          life: 4000,
        });
      });
  }
}

function buildForm(): FormGroup<ResendEmailConfirmationForm> {
  return new FormGroup<ResendEmailConfirmationForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        CommonValidators.email(),
      ],
    }),
  });
}
