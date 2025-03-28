import {NgModule} from '@angular/core';
import {PanelHeaderWithButtonsComponent} from './panel-header-with-buttons.component';

/**
 * @deprecated Use PanelHeaderActionsComponent instead
 */
@NgModule({
  declarations: [PanelHeaderWithButtonsComponent],
  exports: [PanelHeaderWithButtonsComponent],
})
export class PanelHeaderWithButtonsModule {
}
