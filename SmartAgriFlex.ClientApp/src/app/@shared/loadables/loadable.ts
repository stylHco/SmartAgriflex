import {BehaviorSubject, from, ObservableInput, Observer, Subscription} from "rxjs";
import {LoadableState, LoadableStateLoading, LoadableStateNotStarted, LoadableStateType} from "./loadable-states";

export type LoadableValueSource<TValue> = () => ObservableInput<TValue>;

// No point repeating
const stateNotStarted: LoadableStateNotStarted = {type: LoadableStateType.NotStarted};
const stateLoading: LoadableStateLoading = {type: LoadableStateType.Loading};

export class Loadable<TValue> {
  private _stateSubject = new BehaviorSubject<LoadableState<TValue>>(stateNotStarted);
  private _source: LoadableValueSource<TValue> | null = null;

  private _subscription: Subscription | null = null;

  constructor()
  constructor(source: LoadableValueSource<TValue>)
  constructor(source: LoadableValueSource<TValue>, startImmediately: boolean)
  constructor(source?: LoadableValueSource<TValue>, startImmediately?: boolean) {
    if (source) {
      this.source = source;

      if (startImmediately) {
        this.load();
      }
    }
  }

  public get state(): LoadableState<TValue> {
    return this._stateSubject.value;
  }

  public readonly state$ = this._stateSubject.asObservable();

  get source(): LoadableValueSource<TValue> | null {
    return this._source;
  }

  set source(value: LoadableValueSource<TValue> | null) {
    this._source = value;
    this._resetState();
  }

  private _resetState() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }

    this._stateSubject.next(stateNotStarted);
  }

  public load(): void {
    this._ensureState(LoadableStateType.NotStarted);
    this.tryLoadEnsureSource();
  }

  public tryLoadEnsureSource(): void {
    if (this.state.type !== LoadableStateType.NotStarted) return;

    this._doLoadEnsureSource();
  }

  private _doLoadEnsureSource() {
    if (this.source === null) {
      throw new Error('Loadable: cannot load with no source');
    }

    this._stateSubject.next(stateLoading);

    let obsInput: ObservableInput<TValue>;
    try {
      obsInput = this.source();
    } catch (e) {
      this._setFailed(e);
      return;
    }

    this._subscription = from(obsInput)
      .subscribe(new LoadingObserver(this));
  }

  /**
   * Reverts to NotStarted if currently Loading, does nothing otherwise.
   */
  public cancelLoading(): void {
    if (this.state.type == LoadableStateType.Loading) {
      this._resetState();
    }
  }

  public retry(): void {
    this._ensureState(LoadableStateType.Failed);
    this.tryRestartEnsureSource();
  }

  /**
   * Instantly discards the current state and loads from scratch.
   * Will throw if no source is assigned.
   */
  public loadFresh(): void {
    this._doLoadEnsureSource();
  }

  public tryRestartEnsureSource(): void {
    if (this.state.type !== LoadableStateType.Failed) return;

    this._doLoadEnsureSource();
  }

  _setFailed(error: any): void {
    this._ensureState(LoadableStateType.Loading);

    this._stateSubject.next({
      type: LoadableStateType.Failed,
      error,
    });
  }

  _setSucceeded(value: TValue): void {
    this._ensureState(LoadableStateType.Loading);

    this._stateSubject.next({
      type: LoadableStateType.Succeeded,
      value,
    });
  }

  private _ensureState(stateType: LoadableStateType): void {
    const current = this.state.type;

    if (current !== stateType) {
      throw new Error(`Loadable: expected ${stateType} but currently is ${current}`);
    }
  }
}

// TODO: How is the mid-pipeline unsubscribing (e.g. `untilDestroyed()`) handled?

class LoadingObserver<TValue> implements Observer<TValue> {
  constructor(
    private readonly loadable: Loadable<TValue>,
  ) {
  }

  private _hasValue: boolean = false;
  private _lastValue?: TValue;

  next(value: TValue): void {
    this._hasValue = true;
    this._lastValue = value;
  }

  error(err: any): void {
    this.loadable._setFailed(err);
  }

  complete(): void {
    if (!this._hasValue) {
      this.loadable._setFailed(new Error('Source completed but no value was produced'));
      return;
    }

    this.loadable._setSucceeded(this._lastValue!);
  }
}
