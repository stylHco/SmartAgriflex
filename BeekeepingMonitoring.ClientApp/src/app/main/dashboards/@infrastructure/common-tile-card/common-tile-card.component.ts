import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CardModule} from "primeng/card";

@Component({
  selector: 'app-dash-common-tile-card',
  standalone: true,
  imports: [CardModule],
  template: `
    <p-card>
      <ng-content/>
    </p-card>
  `,
  styleUrls: ['./common-tile-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonTileCardComponent {
}
