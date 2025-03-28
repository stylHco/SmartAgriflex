import {
  ChangeDetectorRef,
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Input, OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {LoadablesAggregate} from "../../loadable-aggregation";

@Directive({
  selector: '[loadableWhenLoadingAny]'
})
export class WhenLoadingAnyDirective implements DoCheck, OnDestroy {
  private readonly _unsubscribeSubject = new Subject<void>();

  @Input('loadableWhenLoadingAny')
  set loadables(value: LoadablesAggregate<any> | undefined) {
    if (value === this._aggregate) return;

    this._unsubscribe();

    this._aggregate = value;
    this._dirty = true;

    if (!value) return;

    value.anyLoading.value$
      .pipe(
        takeUntil(this._unsubscribeSubject),
      )
      .subscribe(() => {
        this._dirty = true;
        this.cd.markForCheck();
      });
  }

  private _aggregate: LoadablesAggregate<any> | undefined;
  private _dirty: boolean = false;

  private _viewRef: EmbeddedViewRef<void> | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<void>,
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

    if (!this._aggregate.anyLoading.value) {
      this._destroyView();
      return;
    }

    // Should show the view at this point

    if (!this._viewRef) {
      this._viewRef = this.viewContainerRef.createEmbeddedView(
        this.templateRef,
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
}
