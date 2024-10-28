import {Component} from '@angular/core';

/**
 * @deprecated Use PanelHeaderActionsComponent instead
 */
@Component({
  selector: 'app-panel-header-with-buttons',
  template: `
    <span class="p-panel-title">
      <ng-content></ng-content>
    </span>
    <div class="buttons">
      <ng-content select="button, a"></ng-content>
    </div>
  `,
  styleUrls: ['./panel-header-with-buttons.component.scss']
})
export class PanelHeaderWithButtonsComponent {
}
