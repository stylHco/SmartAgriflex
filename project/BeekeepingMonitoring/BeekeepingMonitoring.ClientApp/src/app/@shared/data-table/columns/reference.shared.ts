import {Changeable} from "../../utils/changeable";
import {MaybeReactive} from "../../utils/reactivity-interop";
import {RouterNavCommands} from "../../utils/routing-helpers";

export const KEY_PROVIDER_INPUT = '__KEY_PROVIDER';
export const LABEL_PROVIDER_INPUT = '__LABEL_PROVIDER';
export const ROUTE_PROVIDER_INPUT = '__ROUTE_PROVIDER';

/**
 * Must
 * * return a value that can easily be JSON.stringifed
 * * not return null or undefined
 * * be idempotent
 * * be fast
 */
export type KeyProvider<T = any> = (fieldValue: T) => unknown;
export type LabelProvider<T = any> = (fieldValue: T) => Changeable<string>;
export type RouteCommandsProvider<T = any> = (item: T) => MaybeReactive<RouterNavCommands>;
