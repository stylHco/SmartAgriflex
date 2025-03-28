import {ChangeDetectorRef, Directive, NgModule} from '@angular/core';

/**
 * Allows fetching the ChangeDetector of a @ViewChild() or similar.
 */
@Directive({
  selector: '[appCdFacade]',
  exportAs: 'appCdFacade',
})
export class ChangeDetectorFacadeDirective {
  constructor(
    public readonly cd: ChangeDetectorRef,
  ) {
  }
}

@NgModule({
  declarations: [ChangeDetectorFacadeDirective],
  exports: [ChangeDetectorFacadeDirective],
})
export class ChangeDetectorFacadeModule {
}
