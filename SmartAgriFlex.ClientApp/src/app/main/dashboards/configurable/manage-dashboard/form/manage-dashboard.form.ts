import {FormControl, FormGroup} from "@angular/forms";
import {CommonValidators} from "../../../../../@shared/utils/common-validators";

export interface ManageDashboardForm {
  name: FormControl<string>;
}

export function buildManageDashboardForm(): FormGroup<ManageDashboardForm> {
  return new FormGroup<ManageDashboardForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        CommonValidators.required(),
        CommonValidators.minLength({value: 3}),
      ],
    }),
  });
}
