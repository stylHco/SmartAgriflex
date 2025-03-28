import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {CommonValidators} from "../../@shared/utils/common-validators";
import {SubmittableFormDisabler} from "../../@shared/submittable-form/submittable-form-disabler";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../@core/auth/auth.service";
import {CommonToastsService} from "../../@shared/common-toasts/common-toasts.service";
import {PredefinedToastsService} from "../../@shared/common-toasts/predefined-toasts.service";
import {ConfirmEmailModel} from "../../@core/auth/confirm-email.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

interface ConfirmEmailForm {
  email: FormControl<string>;
  code: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent implements OnInit {
  form: FormGroup<ConfirmEmailForm> = buildForm();
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

    if (this.form.touched && this.form.valid) {
      this.submitForm();
    }
  }

  // TODO: loc the toasts
  submitForm(): void {
    const model = new ConfirmEmailModel(this.form.getRawValue());

    this.authService.confirmEmail(model)
      .pipe(
        this.formDisabler.monitor.monitor(),
        this.predefinedToasts.internalErrorRxMonitor(),
        untilDestroyed(this),
      )
      .subscribe(result => {
        if (result) {
          this.form.markAsPristine();
          this.commonToasts.showBasicSuccess({
            summary: 'Email confirmed',
            detail: 'You may now login',
            life: 4000,
          });
          this.router.navigateByUrl('/auth/login');
          return;
        }

        this.commonToasts.showBasicError({
          summary: 'Error',
          detail: 'The combination of email and code is invalid',
          life: 3000,
        });
      });
  }
}

function buildForm(): FormGroup<ConfirmEmailForm> {
  return new FormGroup<ConfirmEmailForm>({
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
  });
}
