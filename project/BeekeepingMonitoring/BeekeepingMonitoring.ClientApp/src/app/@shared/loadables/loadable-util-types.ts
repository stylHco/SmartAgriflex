import {Loadable} from "./loadable";
import {LoadableState} from "./loadable-states";

export type LoadableValueOf<TLoadable> = TLoadable extends Loadable<infer TValue> ? TValue : never;
export type LoadableStateOf<TLoadable> = TLoadable extends Loadable<infer TValue> ? LoadableState<TValue> : never;

export type LoadablesMap = Readonly<Record<any, Loadable<any>>>;

// Too much effort to implement the array support in all tooling - will do when it's actually needed

// export type LoadablesArray = Loadable<any>[];
// export type LoadablesTuple = readonly Loadable<any>[];

export type LoadablesView = LoadablesMap /*| LoadablesTuple*/;

export type LoadablesValues<TView extends LoadablesView> = {
  [K in keyof TView]: LoadableValueOf<TView[K]>
};

export type LoadablesState<TView extends LoadablesView> = {
  [K in keyof TView]: LoadableStateOf<TView[K]>
};

export type LoadablesErrors<TView extends LoadablesView> = {
  [K in keyof TView]?: any
};

export type LoadableOrView = Loadable<any> | LoadablesView;
