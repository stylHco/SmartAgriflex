import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonTileCardComponent} from "../common-tile-card/common-tile-card.component";

@Component({
  standalone: true,
  imports: [CommonTileCardComponent],
  template: `
    <app-dash-common-tile-card>
      <div class="m-2">
        Simple text tile
      </div>
    </app-dash-common-tile-card>
  `,
  styles: [
    `:host {
      display: contents;
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DummyTextComponent {
}
