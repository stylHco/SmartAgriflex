export enum LoadableStateType {
  NotStarted,
  Loading,
  Failed,
  Succeeded,
}

export type LoadableStateNotStarted = { type: LoadableStateType.NotStarted };
export type LoadableStateLoading = { type: LoadableStateType.Loading };

export type LoadableStateFailed = {
  type: LoadableStateType.Failed;
  error: any;
};

export type LoadableStateSucceeded<TValue> = {
  type: LoadableStateType.Succeeded;
  value: TValue;
};

export type LoadableStateUnfinished = LoadableStateNotStarted|LoadableStateLoading;
export type LoadableStateNoValue = LoadableStateUnfinished|LoadableStateFailed;

export type LoadableState<TValue> = LoadableStateNoValue|LoadableStateSucceeded<TValue>;
