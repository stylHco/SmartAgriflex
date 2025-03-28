import {Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {SubmittableFormDisabler} from "../../@shared/submittable-form/submittable-form-disabler";
import {CommonValidators} from "../../@shared/utils/common-validators";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../@core/auth/auth.service";
import {CommonToastsService} from "../../@shared/common-toasts/common-toasts.service";
import {RegisterModel} from "../../@core/auth/register.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {PredefinedToastsService} from "../../@shared/common-toasts/predefined-toasts.service";

interface RegisterForm {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: FormGroup<RegisterForm> = buildForm();
  formDisabler = new SubmittableFormDisabler(this.form);

  constructor(
    readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly commonToasts: CommonToastsService,
    private readonly predefinedToasts: PredefinedToastsService,
    private readonly router: Router,
  ) {
  }

  // TODO: loc the toasts
  submitForm(): void {
    this.authService.register(new RegisterModel({
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
    }))
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.predefinedToasts.internalErrorRxMonitor(),
        untilDestroyed(this),
      )
      .subscribe({
        next: result => {
          if (result.succeeded) {
            this.form.markAsPristine();
            this.router.navigate(['../login'], {relativeTo: this.activatedRoute});
            this.commonToasts.showBasicSuccess({
              summary: 'Registered',
              detail: 'Please check your email to activate your account',
              life: 5000,
            });
            return;
          }

          if (!result.errors) {
            this.predefinedToasts.internalError();
            return;
          }

          for (const error of result.errors) {
            this.commonToasts.showBasicError({
              summary: 'Error',
              detail: error.description,
              life: result.errors.length * 1500,
            });
          }
        },
      });
  }
}

function buildForm(): FormGroup<RegisterForm> {
  return new FormGroup<RegisterForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        CommonValidators.email(),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
      ],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        RxwebValidators.compare({fieldName: 'password', message: 'Passwords must match'}), // TODO: loc
      ],
    }),
  });
}
