import {Component, DoCheck, Inject, Renderer2} from '@angular/core';
import {FormLossPreventionService} from "../form-loss-prevention.service";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-form-loss-listener',
  template: ``,
  styles: [
    ':host { display: none }'
  ],
})
export class FormLossListenerComponent implements DoCheck {
  constructor(
    private readonly lossPreventionService: FormLossPreventionService,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
  }

  private unregisterFn?: () => any;

  ngDoCheck(): void {
    const shouldListen = this.lossPreventionService.anyPendingChanges();

    if (shouldListen && !this.unregisterFn) this.register();
    else if (!shouldListen && this.unregisterFn) this.unregister();
  }

  private register(): void {
    console.debug('FormLossListenerComponent::register');

    this.unregisterFn = this.renderer.listen(this.document.defaultView, 'beforeunload', $event => {
      this.unloadNotification($event);
    });
  }

  private unloadNotification($event: BeforeUnloadEvent): void {
    if (this.lossPreventionService.anyPendingChanges()) {
      $event.returnValue = true;
    }
  }

  private unregister(): void {
    console.debug('FormLossListenerComponent::unregister');

    this.unregisterFn?.();
    this.unregisterFn = undefined;
  }
}
