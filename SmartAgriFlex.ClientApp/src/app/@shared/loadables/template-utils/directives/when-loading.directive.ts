import {
  ChangeDetectorRef,
  Directive, DoCheck,
  EmbeddedViewRef,
  Input, OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {Subscription} from "rxjs";
import {Loadable} from "../../loadable";
import {LoadableStateType} from "../../loadable-states";

@Directive({
  selector: '[loadableWhenLoading]',
})
export class WhenLoadingDirective implements DoCheck, OnDestroy {
  @Input('loadableWhenLoading')
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
    if (!this._loadable || this._loadable.state.type !== LoadableStateType.Loading) {
      if (this._viewRef) {
        this._viewRef.destroy();
        this._viewRef = null;
      }

      return;
    }

    if (this._loadable.state.type === LoadableStateType.Loading) {
      if (!this._viewRef) {
        this._viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
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
}
