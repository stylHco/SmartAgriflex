import {Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonValidators} from "../../@shared/utils/common-validators";
import {AuthService} from "../../@core/auth/auth.service";
import {SubmittableFormDisabler} from "../../@shared/submittable-form/submittable-form-disabler";
import {LoginModel} from "../../@core/auth/login.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {CommonToastsService} from "../../@shared/common-toasts/common-toasts.service";
import {PredefinedToastsService} from "../../@shared/common-toasts/predefined-toasts.service";

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

@UntilDestroy()
@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup<LoginForm> = buildForm();
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
    this.authService.login(new LoginModel({
      username: this.form.controls.email.value,
      password: this.form.controls.password.value,
      rememberMe: this.form.controls.rememberMe.value,
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
            this.router.navigateByUrl(this.getReturnUrl());
            return;
          }

          if (result.isNotAllowed) {
            this.commonToasts.showBasicError({
              summary: 'Not allowed',
              detail: 'Did you confirm your email?',
            });
            return;
          }

          // TODO

          this.commonToasts.showBasicError({
            summary: 'Login failed',
            detail: 'Please double check your credentials',
          });
        },
      });
  }

  private getReturnUrl(): string {
    return this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }
}

function buildForm(): FormGroup<LoginForm> {
  return new FormGroup<LoginForm>({
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
    rememberMe: new FormControl(false, {nonNullable: true}),
  });
}
