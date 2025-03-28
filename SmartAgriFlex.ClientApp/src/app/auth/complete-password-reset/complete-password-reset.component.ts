import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../@core/auth/auth.service";
import {CommonToastsService} from "../../@shared/common-toasts/common-toasts.service";
import {SubmittableFormDisabler} from "../../@shared/submittable-form/submittable-form-disabler";
import {CommonValidators} from "../../@shared/utils/common-validators";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {PredefinedToastsService} from "../../@shared/common-toasts/predefined-toasts.service";
import {CompletePasswordResetModel} from "../../@core/auth/complete-password-reset.model";

interface CompletePasswordResetForm {
  email: FormControl<string>;
  code: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './complete-password-reset.component.html',
})
export class CompletePasswordResetComponent implements OnInit {
  form: FormGroup<CompletePasswordResetForm> = buildForm();
  formDisabler = new SubmittableFormDisabler(this.form);

  constructor(
    readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly commonToasts: CommonToastsService,
    private readonly predefinedToasts: PredefinedToastsService,
    private readonly router: Router,
  ) {
  }

  ngOnInit() {
    const {email, code} = this.activatedRoute.snapshot.queryParams;

    if (email) {
      this.form.controls.email.setValue(email);
      this.form.controls.email.markAsTouched();
    }

    if (code) {
      this.form.controls.code.setValue(code);
      this.form.controls.code.markAsTouched();
    }
  }

  // TODO: loc the toasts
  submitForm(): void {
    const model = new CompletePasswordResetModel({
      email: this.form.controls.email.value,
      code: this.form.controls.code.value,
      password: this.form.controls.password.value,
    });

    this.authService.completePasswordReset(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.predefinedToasts.internalErrorRxMonitor(),
        untilDestroyed(this),
      )
      .subscribe(result => {
        if (result.succeeded) {
          this.form.markAsPristine();
          this.commonToasts.showBasicSuccess({
            summary: 'Password reset',
            detail: 'You may now login with your new password',
            life: 4000,
          });
          this.router.navigateByUrl('/auth/login');
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
      });
  }
}

function buildForm(): FormGroup<CompletePasswordResetForm> {
  return new FormGroup<CompletePasswordResetForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        CommonValidators.email(),
      ],
    }),
    code: new FormControl('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
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
