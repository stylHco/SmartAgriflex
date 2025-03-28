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
  selector: '[loadableWhenFailed]'
})
export class WhenFailedDirective implements DoCheck, OnDestroy {
  @Input('loadableWhenFailed')
  set loadable(value: Loadable<any> | undefined) {
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

  private _loadable: Loadable<any> | undefined;
  private _dirty: boolean = false;

  private _subscription: Subscription | undefined;

  private _viewRef: EmbeddedViewRef<WhenFailedContext> | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<WhenFailedContext>,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngDoCheck(): void {
    if (!this._dirty) return;

    this._update();
    this._dirty = false;
  }

  private _update(): void {
    if (!this._loadable || this._loadable.state.type !== LoadableStateType.Failed) {
      if (this._viewRef) {
        this._viewRef.destroy();
        this._viewRef = null;
      }

      return;
    }

    if (this._loadable.state.type === LoadableStateType.Failed) {
      const error = this._loadable.state.error;

      if (this._viewRef) {
        this._viewRef.context.$implicit = error;
        this._viewRef.markForCheck();
      } else {
        this._viewRef = this.viewContainerRef.createEmbeddedView(
          this.templateRef,
          new WhenFailedContext(error, this._retryBound),
        );
      }
    }
  }

  private _retry(): void {
    if (!this._loadable) {
      console.error('WhenLoadableFailedDirective::_retry called when no loadable is set');
      return;
    }

    if (this._loadable.state.type !== LoadableStateType.Failed) {
      console.error('WhenLoadableFailedDirective::_retry called when loadable state is not Failed');
      return;
    }

    this._loadable.retry();
  }

  private _retryBound = this._retry.bind(this);

  private _unsubscribe(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribe();
  }

  static ngTemplateContextGuard(
    directive: WhenFailedDirective,
    context: unknown,
  ): context is WhenFailedContext {
    return true;
  }
}

export class WhenFailedContext {
  constructor(
    /**
     * The error
     */
    public $implicit: any,
    public readonly retryFn: () => void,
  ) {
  }
}
