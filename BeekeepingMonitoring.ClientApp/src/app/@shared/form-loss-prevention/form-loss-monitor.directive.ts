import {Directive, Host, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroupDirective} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {FormLossPreventionService, IMonitoredForm} from "./form-loss-prevention.service";

@Directive({
  selector: '[formGroup][lossMonitor]'
})
export class FormLossMonitorDirective implements OnInit, OnDestroy {
  @Input('lossRouteFilter')
  set routeFilter(value: ActivatedRoute) {
    this.monitoredForm.routeFilter = value.routeConfig;
  }

  private monitoredForm: IMonitoredForm = {
    form: undefined!,
    routeFilter: null,
  };

  constructor(
    private readonly lossPreventionService: FormLossPreventionService,
    @Host() private readonly formGroupDirective: FormGroupDirective,
  ) {
  }

  ngOnInit(): void {
    this.monitoredForm.form = this.formGroupDirective.control;

    this.lossPreventionService.registerForm(this.monitoredForm);
  }

  ngOnDestroy(): void {
    this.lossPreventionService.unregisterForm(this.monitoredForm);
  }
}
