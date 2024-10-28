import {BehaviorSubject, combineLatest, Observable, switchMap} from "rxjs";
import {LoadablesErrors, LoadablesState, LoadablesValues, LoadablesView} from "./loadable-util-types";
import {LoadableStateType} from "./loadable-states";
import {Changeable, changeableFromTrigger} from "../utils/changeable";
import {Loadable} from "./loadable";

export class LoadablesAggregate<TView extends LoadablesView> {
  // The correct value will be set right after in the constructor, but creating the subject
  // here allows to move the initialization for dependant fields out of the ctor.
  private readonly _loadablesSubject = new BehaviorSubject<TView>(undefined as any);

  constructor(
    loadables: TView,
  ) {
    this._loadablesSubject.next(loadables);
  }

  public get loadables(): TView {
    return this._loadablesSubject.value;
  }

  public set loadables(loadables: TView) {
    this._loadablesSubject.next(loadables);
  }

  public states: Changeable<LoadablesState<TView>> = changeableFromTrigger(
    this._loadablesSubject
      .pipe(
        switchMap(loadables => {
          const arr: Observable<any>[] = [];

          for (const key in loadables) {
            arr.push(loadables[key].state$);
          }

          // Type assertions are to convert from Observable<any[]>
          return combineLatest(arr) as unknown as Observable<void>;
        }),
      ),

    () => {
      const states: LoadablesState<TView> = <any>{};

      for (const key in this.loadables) {
        states[key] = this.loadables[key].state as any; // TODO: typing
      }

      return states;
    },
    {
      // We are starting from a behaviour subject, no need for the additional emit
      skipInitialEmit: true,
      distinctUntilChanged: true,
    },
  );

  // TODO: better arg type
  /**
   * @param action Return false to stop iterating, true to keep iterating (default)
   */
  public forEachLoadable(action: (loadable: Loadable<any>) => void | boolean): void {
    for (const key in this._loadablesSubject.value) {
      const result = action(this._loadablesSubject.value[key]);

      if (typeof result === 'boolean' && !result) return;
    }
  }

  public loadAllNotStarted(): void {
    this.forEachLoadable(loadable => loadable.tryLoadEnsureSource());
  }

  public retryAllFailed(): void {
    this.forEachLoadable(loadable => loadable.tryRestartEnsureSource());
  }

  public cancelAllLoading(): void {
    this.forEachLoadable(loadable => loadable.cancelLoading());
  }

  public allLoaded: Changeable<LoadablesValues<TView> | null> = changeableFromTrigger(
    this.states.value$ as unknown as Observable<void>,
    () => statesToAllLoaded(this.states.value),
    {
      skipInitialEmit: true,
      distinctUntilChanged: true,
    },
  );

  public anyLoading: Changeable<boolean> = changeableFromTrigger(
    this.states.value$ as unknown as Observable<void>,
    () => {
      let anyLoading = false;

      this.forEachLoadable(loadable => {
        if (loadable.state.type === LoadableStateType.Loading) {
          anyLoading = true;
          return false;
        }

        return true;
      });

      return anyLoading;
    },
    {
      skipInitialEmit: true,
      distinctUntilChanged: true,
    },
  );

  /**
   * Has value if at least 1 loadable has failed and no loadables are in progress
   */
  public completedWithFailed: Changeable<LoadablesErrors<TView> | null> = changeableFromTrigger(
    this.states.value$ as unknown as Observable<void>,
    () => {
      const errors: LoadablesErrors<TView> = {};

      for (let key in this.loadables) {
        const state = this.loadables[key].state;

        if (state.type === LoadableStateType.Loading) {
          return null;
        }

        if (state.type === LoadableStateType.Failed) {
          errors[key] = state.error;
        }
      }

      // Nothing failed case
      if (Object.keys(errors).length < 1) {
        return null;
      }

      return errors;
    },
    {
      skipInitialEmit: true,
      distinctUntilChanged: true,
    },
  );
}

function statesToAllLoaded<TView extends LoadablesView>(states: LoadablesState<TView>): LoadablesValues<TView> | null {
  const values: LoadablesValues<TView> = {} as any;

  for (const key in states) {
    const state = states[key];

    if (state.type !== LoadableStateType.Succeeded) {
      return null;
    }

    values[key] = state.value;
  }

  return values;
}
