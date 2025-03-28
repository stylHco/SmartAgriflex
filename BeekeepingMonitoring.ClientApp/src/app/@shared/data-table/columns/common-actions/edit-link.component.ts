import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {COMMON_ACTIONS_CONTEXT} from "./common-actions.column";
import {DT_ROW_MODEL_INPUT} from "../../common";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {TranslocoModule} from "@ngneat/transloco";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RouterLink,
    TranslocoModule,
  ],
  template: `
    <a pButton class="p-button-text p-button-icon-only" icon="pi pi-pencil"
       [routerLink]="editLink" [title]="'buttons.edit' | transloco">
    </a>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLinkComponent {
  private readonly actionsContext = inject(COMMON_ACTIONS_CONTEXT);

  @Input(DT_ROW_MODEL_INPUT)
  rowModel?: any;

  get editLink(): any[] | string {
    return this.actionsContext.getEditLinkCommands(this.rowModel);
  }
}
