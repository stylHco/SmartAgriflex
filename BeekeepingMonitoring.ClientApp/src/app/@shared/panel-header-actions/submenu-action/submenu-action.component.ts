import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {TieredMenuModule} from "primeng/tieredmenu";

@Component({
  selector: 'app-panel-header-submenu-action',
  standalone: true,
  imports: [ButtonModule, TieredMenuModule],
  templateUrl: './submenu-action.component.html',
  styles: [':host { display: contents }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmenuActionComponent {
  @Input()
  public item: MenuItem = {};

  @Input()
  public children: MenuItem[] | undefined;
}
