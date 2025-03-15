import { ChangeDetectionStrategy, Component } from '@angular/core';
import {LiveDataForSensorComponent} from "../../@shared/live-data-for-sensor/live-data-for-sensor.component";
import {LiveGaugeComponent} from "../../@shared/live-gauge/live-gauge.component";

@Component({
  selector: 'app-custom-dashboard',
  standalone: true,
  imports: [
    LiveDataForSensorComponent,
    LiveGaugeComponent
  ],
  templateUrl: './custom-dashboard.component.html',
  styleUrl: './custom-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomDashboardComponent {

}
