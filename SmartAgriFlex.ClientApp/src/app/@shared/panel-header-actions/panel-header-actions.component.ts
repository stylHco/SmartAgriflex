import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MenuItem} from "primeng/api";
import {SubmenuActionComponent} from "./submenu-action/submenu-action.component";
import {AtomicActionComponent} from "./atomic-action/atomic-action.component";

@Component({
  selector: 'app-panel-header-actions',
  standalone: true,
  imports: [
    CommonModule,
    SubmenuActionComponent,
    AtomicActionComponent,
  ],
  templateUrl: './panel-header-actions.component.html',
  styleUrls: ['./panel-header-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelHeaderActionsComponent {
  @Input()
  public items: MenuItem[] = [];
}
