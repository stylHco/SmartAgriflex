import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {Loadable} from "../../loadable";
import {LoadableStateType} from "../../loadable-states";
import {Subject, takeUntil} from "rxjs";

/**
 * Will automatically load once ngOnInit is called and cancel loading when ngOnDestroy is called.
 * Will not affect loadables that are already loading or failed or were completed.
 *
 * While a loadable is assigned to this directive only updating the source
 * or restarting a failed load is allowed.
 */
@Directive({
  selector: '[appLoadableAutoManage]'
})
export class LoadableAutoManageDirective implements OnInit, OnDestroy {
  private _hasBeenInit: boolean = false;

  private readonly _unsubscribeFromStateUpdates = new Subject<void>();

  /**
   * Must have source set
   */
  @Input('appLoadableAutoManage')
  set loadable(value: Loadable<any>) {
    if (value === this._loadable) return;

    this._unsubscribeFromStateUpdates.next();

    this._updateCurrent(false);
    this._loadable = value;
    this._updateCurrent(true);

    // Detect changes to the source
    this._loadable.state$
      .pipe(
        takeUntil(this._unsubscribeFromStateUpdates),
      )
      .subscribe(state => {
        if (state.type === LoadableStateType.NotStarted) {
          this._updateCurrent(true);
        }
      });
  }

  private _loadable?: Loadable<unknown>;

  ngOnInit(): void {
    this._hasBeenInit = true;
    this._updateCurrent(true);
  }

  ngOnDestroy(): void {
    this._unsubscribeFromStateUpdates.next();
    this._updateCurrent(false);
  }

  private _updateCurrent(shouldLoad: boolean): void {
    if (!this._hasBeenInit) return;
    if (!this._loadable) return;

    if (
      shouldLoad &&
      this._loadable.state.type === LoadableStateType.NotStarted &&
      this._loadable.source !== null
    ) {
      this._loadable.load();
    }

    if (!shouldLoad && this._loadable.state.type === LoadableStateType.Loading) {
      this._loadable.cancelLoading();
    }
  }
}
