import {Component, Input, Optional} from '@angular/core';
import {AbstractControl, FormGroupDirective} from "@angular/forms";

@Component({
  selector: 'app-form-control-errors',
  template: `
    <ng-container *transloco="let t">
      <small class="p-error block" *ngFor="let error of currentErrors">
        {{ t(error) }}
      </small>

      <small *ngIf="isPending">
        <i>{{ t('generic.validation_in_progress') }}</i>
      </small>
    </ng-container>
  `
})
export class FormControlErrorsComponent {
  @Input() controlName: string = '';
  @Input() control?: AbstractControl;

  @Input() requireTouched: boolean = true;

  constructor(
    @Optional() private readonly formGroup: FormGroupDirective,
  ) {
  }

  protected get currentErrors(): string[] {
    const control = this.getActualControl();

    if (!control) {
      return [];
    }

    if (this.requireTouched && !control.touched) return [];
    if (!control.errors) return [];

    let errors = [];

    for (let errorsKey in control.errors) {
      if (control.errors.hasOwnProperty(errorsKey)) {
        errors.push(control.errors[errorsKey].message);
      }
    }

    return errors;
  }

  protected get isPending(): boolean {
    const control = this.getActualControl();
    if (!control) return false;

    if (this.requireTouched && !control.touched) return false;

    return control.pending;
  }

  private getActualControl(): AbstractControl | undefined {
    let control = this.control;

    if (!control && this.controlName && this.formGroup) {
      control = this.formGroup.form.controls[this.controlName];
    }

    return control;
  }
}
