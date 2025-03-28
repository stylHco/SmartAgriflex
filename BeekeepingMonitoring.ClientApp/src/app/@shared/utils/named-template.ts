import {Directive, Input, NgModule, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ng-template[appNamed]',
})
export class NamedTemplateDirective {
  @Input('appNamed')
  name!: string;

  constructor(
    public readonly templateRef: TemplateRef<any>,
  ) {
  }
}

@NgModule({
  declarations: [NamedTemplateDirective],
  exports: [NamedTemplateDirective],
})
export class NamedTemplateModule {
}
