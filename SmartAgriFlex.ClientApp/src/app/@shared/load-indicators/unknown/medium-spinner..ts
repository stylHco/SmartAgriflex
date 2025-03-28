import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {TranslocoModule} from "@ngneat/transloco";

@Component({
  selector: 'app-l-ind-u-med-spinner',
  template: `
    <p-progressSpinner [title]="'generic.loading_ellipsis' | transloco"></p-progressSpinner>
  `,
  styleUrls: [
    '../../comp-styles/center-vert-items.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadIndicatorMediumSpinnerComponent {
}

@NgModule({
  imports: [
    ProgressSpinnerModule,
    TranslocoModule,
  ],
  declarations: [LoadIndicatorMediumSpinnerComponent],
  exports: [LoadIndicatorMediumSpinnerComponent],
})
export class LoadIndicatorMediumSpinnerModule {
}
