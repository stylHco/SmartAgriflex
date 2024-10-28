import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {TranslocoModule} from "@ngneat/transloco";
import {COMMON_ACTIONS_CONTEXT} from "./common-actions.column";
import {DT_ROW_MODEL_INPUT} from "../../common";

@Component({
  standalone: true,
  imports: [
    ButtonModule,
    RouterLink,
    TranslocoModule,
  ],
  template: `
    <a pButton class="p-button-text p-button-icon-only" icon="pi pi-search"
       [routerLink]="viewLink" [title]="'buttons.viewDetails' | transloco">
    </a>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsLinkComponent {
  private readonly actionsContext = inject(COMMON_ACTIONS_CONTEXT);

  @Input(DT_ROW_MODEL_INPUT)
  rowModel?: any;

  get viewLink(): any[] | string {
    return this.actionsContext.getViewLinkCommands(this.rowModel);
  }
}
