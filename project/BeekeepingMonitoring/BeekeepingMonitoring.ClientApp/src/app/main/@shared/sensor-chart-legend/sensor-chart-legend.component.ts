import { ChangeDetectionStrategy, Component } from '@angular/core';
import {CardModule} from "primeng/card";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-sensor-chart-legend',
  standalone: true,
  imports: [
    CommonModule,
    CardModule
  ],
  templateUrl: './sensor-chart-legend.component.html',
  styleUrl: './sensor-chart-legend.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorChartLegendComponent {

}
