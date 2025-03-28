import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-panel-header-atomic-action',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RouterLink,
  ],
  templateUrl: './atomic-action.component.html',
  styles: [':host { display: contents }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomicActionComponent {
  @Input()
  public item: MenuItem = {};

  @Input()
  public index?: number;

  protected onClick(event: MouseEvent): void {
    this.item.command?.({
      originalEvent: event,
      item: this.item,
      index: this.index,
    });
  }
}
