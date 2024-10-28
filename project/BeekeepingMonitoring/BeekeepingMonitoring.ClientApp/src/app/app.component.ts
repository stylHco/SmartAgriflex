import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from "primeng/api";

@Component({
  selector: 'app-root',
  template: `
    <app-form-loss-listener></app-form-loss-listener>
    <app-router-indicator></app-router-indicator>
    <app-common-toasts></app-common-toasts>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    private primeConfig: PrimeNGConfig,
  ) {
  }

  ngOnInit() {
    this.primeConfig.setTranslation({
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: 1,
    });
  }
}
