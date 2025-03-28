import {
  ChangeDetectorRef,
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {Loadable} from "../../loadable";
import {Subscription} from "rxjs";
import {LoadableStateType} from "../../loadable-states";

@Directive({
  selector: '[loadableWhenLoaded]',
})
export class WhenLoadedDirective<TValue> implements DoCheck, OnDestroy {
  @Input('loadableWhenLoaded')
  set loadable(value: Loadable<TValue> | undefined) {
    if (value === this._loadable) return;

    this._unsubscribe();

    this._loadable = value;
    this._dirty = true;

    if (!value) return;

    this._subscription = value.state$
      .subscribe(() => {
        this._dirty = true;
        this.cd.markForCheck();
      });
  }

  private _loadable: Loadable<TValue> | undefined;
  private _dirty: boolean = false;

  private _subscription: Subscription | undefined;

  private _viewRef: EmbeddedViewRef<WhenLoadedContext<TValue>> | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<WhenLoadedContext<TValue>>,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngDoCheck(): void {
    if (!this._dirty) return;

    this._update();
    this._dirty = false;
  }

  private _update(): void {
    if (!this._loadable || this._loadable.state.type !== LoadableStateType.Succeeded) {
      if (this._viewRef) {
        this._viewRef.destroy();
        this._viewRef = null;
      }

      return;
    }

    if (this._loadable.state.type === LoadableStateType.Succeeded) {
      if (this._viewRef) {
        this._viewRef.context.$implicit = this._loadable.state.value;
        this._viewRef.markForCheck();
      } else {
        this._viewRef = this.viewContainerRef.createEmbeddedView(
          this.templateRef,
          new WhenLoadedContext(this._loadable.state.value),
        );
      }
    }
  }

  private _unsubscribe(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribe();
  }

  static ngTemplateContextGuard<TValue>(
    directive: WhenLoadedDirective<TValue>,
    context: unknown
  ): context is WhenLoadedContext<TValue> {
    return true;
  }
}

export class WhenLoadedContext<TValue> {
  constructor(
    public $implicit: TValue,
  ) {
  }

  get loadableWhenLoaded(): TValue {
    return this.$implicit;
  }
}
