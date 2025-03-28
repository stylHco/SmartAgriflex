import {
  ChangeDetectorRef,
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Input, OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {LoadablesView, LoadablesValues} from "../../loadable-util-types";
import {Subject, takeUntil} from "rxjs";
import {LoadablesAggregate} from "../../loadable-aggregation";

@Directive({
  selector: '[loadableWhenLoadedAll]',
})
export class WhenLoadedAllDirective<TView extends LoadablesView> implements DoCheck, OnDestroy {
  private readonly _unsubscribeSubject = new Subject<void>();

  @Input('loadableWhenLoadedAll')
  set loadables(value: LoadablesAggregate<TView> | undefined) {
    if (value === this._aggregate) return;

    this._unsubscribe();

    this._aggregate = value;
    this._dirty = true;

    if (!value) return;

    value.allLoaded.value$
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

  private _viewRef: EmbeddedViewRef<WhenLoadedAllContext<TView>> | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<WhenLoadedAllContext<TView>>,
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

    const value = this._aggregate.allLoaded.value;

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
        new WhenLoadedAllContext(value),
      );
    }
  }

  private _destroyView(): void {
    if (this._viewRef) {
      this._viewRef.destroy();
      this._viewRef = null;
    }
  }

  _unsubscribe(): void {
    this._unsubscribeSubject.next();
  }

  ngOnDestroy(): void {
    this._unsubscribe();
  }

  static ngTemplateContextGuard<TView extends LoadablesView>(
    directive: WhenLoadedAllDirective<TView>,
    context: unknown,
  ): context is WhenLoadedAllContext<TView> {
    return true;
  }
}

export class WhenLoadedAllContext<TView extends LoadablesView> {
  constructor(
    public $implicit: LoadablesValues<TView>,
  ) {
  }

  get loadableWhenLoadedAll(): LoadablesValues<TView> {
    return this.$implicit;
  }
}
