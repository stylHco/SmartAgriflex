import {Component} from '@angular/core';

@Component({
  selector: 'app-required-field-indicator',
  template: `
    <ng-container *transloco="let t">
      <span class="p-error" [title]="t('field_required.alt')">*</span>
    </ng-container>
  `,
  styles: [
    ':host { margin-left: 0.1em }'
  ],
})
export class RequiredFieldIndicatorComponent {
}
