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
import {LoadablesErrors, LoadablesView} from "../../loadable-util-types";
import {Subject, takeUntil} from "rxjs";
import {LoadablesAggregate} from "../../loadable-aggregation";

@Directive({
  selector: '[loadableWhenCompletedWithFailed]'
})
export class WhenCompletedWithFailedDirective<TView extends LoadablesView> implements DoCheck, OnDestroy {
  private readonly _unsubscribeSubject = new Subject<void>();

  @Input('loadableWhenCompletedWithFailed')
  set loadables(value: LoadablesAggregate<TView> | undefined) {
    if (value === this._aggregate) return;

    this._unsubscribe();

    this._aggregate = value;
    this._dirty = true;

    if (!value) return;

    value.completedWithFailed.value$
      .pipe(
        takeUntil(this._unsubscribeSubject),
      )
      .subscribe(() => {
        this._dirty = true;
        this.cd.markForCheck();
      });
  }

  private _aggregate: LoadablesAggregate<TView> | undefined;
  private _dirty: boolean = false;

  private _viewRef: EmbeddedViewRef<WhenCompletedWithFailedContext<TView>> | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<WhenCompletedWithFailedContext<TView>>,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngDoCheck(): void {
    if (!this._dirty) return;

    this._update();
    this._dirty = false;
  }

  private _update(): void {
    if (!this._aggregate) {
      this._destroyView();
      return;
    }

    const value = this._aggregate.completedWithFailed.value;

    if (value === null) {
      this._destroyView();
      return;
    }

    // Should show the view at this point

    if (this._viewRef) {
      this._viewRef.context.$implicit = value;
      this._viewRef.markForCheck();
    } else {
      this._viewRef = this.viewContainerRef.createEmbeddedView(
        this.templateRef,
        new WhenCompletedWithFailedContext(value, this._retryBound),
      );
    }
  }

  private _destroyView(): void {
    if (this._viewRef) {
      this._viewRef.destroy();
      this._viewRef = null;
    }
  }

  private _retry(): void {
    if (!this._aggregate) {
      console.error('WhenCompletedWithFailedDirective::_retry called when no aggregate is set');
      return;
    }

    if (this._aggregate.completedWithFailed.value === null) {
      console.error('WhenCompletedWithFailedDirective::_retry called when completedWithFailed value is null');
      return;
    }

    this._aggregate.retryAllFailed();
  }

  private _retryBound = this._retry.bind(this);

  _unsubscribe(): void {
    this._unsubscribeSubject.next();
  }

  ngOnDestroy(): void {
    this._unsubscribe();
  }

  static ngTemplateContextGuard<TView extends LoadablesView>(
    directive: WhenCompletedWithFailedDirective<TView>,
    context: unknown,
  ): context is WhenCompletedWithFailedContext<TView> {
    return true;
  }
}

export class WhenCompletedWithFailedContext<TView extends LoadablesView> {
  constructor(
    public $implicit: LoadablesErrors<TView>,
    public readonly retryFn: () => void,
  ) {
  }

  get loadableWhenLoadedAll(): LoadablesErrors<TView> {
    return this.$implicit;
  }
}
