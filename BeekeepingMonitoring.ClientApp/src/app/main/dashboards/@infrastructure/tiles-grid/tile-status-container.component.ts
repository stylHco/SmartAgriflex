import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonTileCardComponent} from "../common-tile-card/common-tile-card.component";

@Component({
  selector: 'app-tile-status-container',
  standalone: true,
  imports: [CommonTileCardComponent],
  template: `
      <app-dash-common-tile-card>
        <div class="status-wrapper">
          <ng-content/>
        </div>
      </app-dash-common-tile-card>
  `,
  styleUrls: ['./tile-status-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileStatusContainerComponent {
}
