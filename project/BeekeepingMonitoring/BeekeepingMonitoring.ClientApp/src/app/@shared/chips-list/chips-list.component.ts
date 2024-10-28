import {ChangeDetectionStrategy, Component, Input, TemplateRef} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ChipModule} from "primeng/chip";
import {RouterLink} from "@angular/router";
import {RouterNavCommands} from "../utils/routing-helpers";
import {CoerceObservablePipe, MaybeReactive} from "../utils/reactivity-interop";

@Component({
  selector: 'app-chips-list',
  standalone: true,
  imports: [
    CommonModule,
    ChipModule,
    RouterLink,
    CoerceObservablePipe,
  ],
  templateUrl: './chips-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'chips-list-container',
  },
})
export class ChipsListComponent<TItem> {
  @Input()
  public items: TItem[] = [];

  @Input()
  public displayLimit?: number;

  @Input()
  public labelProvider?: (item: TItem) => MaybeReactive<string>;

  @Input()
  public routerCommandsProvider?: (item: TItem) => MaybeReactive<RouterNavCommands>;

  @Input()
  public labelTemplate?: TemplateRef<ChipLabelTemplateContext<TItem>>;

  /**
   * Automatically wraps the label template in dev.p-chip-text
   * to match the behaviour of passing a string label
   */
  @Input()
  public labelTemplateAutoWrap: boolean = true;

  protected get itemsForDisplay(): TItem[] {
    if (!this.displayLimit) return this.items;

    return this.items.slice(0, this.displayLimit);
  }

  protected get excessCount(): number | undefined {
    if (!this.displayLimit) {
      return undefined;
    }

    if (this.items.length <= this.displayLimit) {
      return undefined;
    }

    return this.items.length - this.displayLimit;
  }
}

export type ChipLabelTemplateContext<T> = {
  $implicit: T,
}
