import {ChangeDetectionStrategy, Component, Input, NgModule} from '@angular/core';
import {TranslocoModule} from "@ngneat/transloco";

@Component({
  selector: 'app-bool-yes-no',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      {{ value ? t('generic.yes') : t('generic.no') }}
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoolYesNoComponent {
  @Input()
  value: boolean = false;
}

/**
 * @deprecated Use the standalone component directly
 */
@NgModule({
  imports: [BoolYesNoComponent],
  exports: [BoolYesNoComponent],
})
export class BoolYesNoModule {
}
