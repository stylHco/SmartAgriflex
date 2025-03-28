import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {CommonValidators} from "../../../@shared/utils/common-validators";
import {SubmittableFormDisabler} from "../../../@shared/submittable-form/submittable-form-disabler";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {CommonToastsService} from "../../../@shared/common-toasts/common-toasts.service";
import {AccountService} from "../../../@core/account/account.service";
import {ChangePasswordModel} from "../../../@core/account/change-password.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

interface ManagePasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@UntilDestroy()
@Component({
  templateUrl: './manage-password.component.html',
})
export class ManagePasswordComponent implements OnInit {
  form: FormGroup<ManagePasswordForm> = buildForm();
  formDisabler = new SubmittableFormDisabler(this.form);

  constructor(
    readonly activatedRoute: ActivatedRoute,
    private readonly accountService: AccountService,
    private readonly commonToasts: CommonToastsService,
  ) {
  }

  ngOnInit(): void {
  }

  submitForm(): void {
    this.accountService.changePassword(new ChangePasswordModel({
      currentPassword: this.form.controls.currentPassword.value,
      newPassword: this.form.controls.newPassword.value,
    }))
      .pipe(
        this.formDisabler.monitor.monitor(),
        untilDestroyed(this),
      )
      .subscribe({
        next: result => {
          if (result.succeeded) {
            this.form.reset();
            this.commonToasts.showBasicSuccess({
              summary: 'Password changed',
              life: 4000,
            });
            return;
          }

          if (!result.errors) {
            this.commonToasts.showBasicError({
              summary: 'Something went wrong. Please try again',
            });
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
        error: () => {
          this.commonToasts.showBasicError({
            summary: 'Something went wrong. Please try again',
          });
        },
      });
  }
}

function buildForm(): FormGroup<ManagePasswordForm> {
  return new FormGroup<ManagePasswordForm>({
    currentPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
      ],
    }),
    newPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
      ],
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        RxwebValidators.compare({fieldName: 'newPassword', message: 'Passwords must match'}), // TODO: loc
      ],
    }),
  });
}
