import {
  ComponentRef,
  Directive, EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnDestroy, Output,
  SimpleChanges,
  StaticProvider,
  ViewContainerRef
} from '@angular/core';
import {LazyComponentBlueprint} from "./lazy-component-loader";
import {createLazyComponent, LazyComponentRef} from "./lazy-component-factory";

@Directive({
  selector: 'app-lazy-component-outlet',
})
export class LazyComponentOutletDirective<TModule = unknown, TComponent = unknown> implements OnChanges, OnDestroy {
  @Input()
  public blueprint: LazyComponentBlueprint<TModule, TComponent>|null = null;

  @Input()
  public componentProviders: StaticProvider[] = [];

  @Output()
  public readonly componentCreated = new EventEmitter<ComponentRef<TComponent>>();

  private _instanceRef: LazyComponentRef<TModule, TComponent>|null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

  /**
   * Recreates the component if it already exists.
   * Does nothing otherwise (i.e. no blueprint is set).
   *
   * Do not call this right after setting inputs - trigger change detection instead
   * (else the component will be created, instantly deleted and created again).
   */
  public recreate(): void {
    this._tryCreate();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Right now any changes require a recreate
    this._tryCreate();
  }

  ngOnDestroy() {
    this._cleanup();
  }

  private _cleanup(): void {
    if (this._instanceRef) {
      this._instanceRef.destroy();
      this._instanceRef = null;
    }
  }

  private _tryCreate(): void {
    this._cleanup();

    if (!this.blueprint) return;

    this._instanceRef = createLazyComponent(
      this.blueprint,
      this.viewContainerRef,
      {
        injectorName: 'LazyComponentOutletDirective',
        componentProviders: this.componentProviders,
      }
    );

    this.componentCreated.emit(this._instanceRef.component);
  }
}

@NgModule({
  declarations: [LazyComponentOutletDirective],
  exports: [LazyComponentOutletDirective],
})
export class LazyComponentOutletModule {
}
