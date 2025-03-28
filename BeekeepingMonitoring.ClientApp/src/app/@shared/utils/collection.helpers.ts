import {KeyValue} from "@angular/common";

// Based on https://stackoverflow.com/a/15996017/2588539
export function removeByCondition<TElement>(array: TElement[], predicate: (element: TElement, i: number) => boolean): void {
  let i = array.length;

  while (i--) {
    if (predicate(array[i], i)) {
      array.splice(i, 1);
    }
  }
}

export function removeElementFromArray<TElement>(array: TElement[], elementToRemove: TElement) {
  removeByCondition(array, element => element === elementToRemove);
}

export function mapGetOrCreate<TKey, TValue>(
  map: Map<TKey, TValue>, key: TKey,
  valueFactory: (key: TKey) => TValue,
): TValue {
  if (map.has(key)) return map.get(key)!;

  const value: TValue = valueFactory(key);
  map.set(key, value);

  return value;
}

export function whereNotUndefined<T>(array: (T | undefined)[]): T[] {
  const filtered: T[] = [];

  for (const item of array) {
    if (item !== undefined) filtered.push(item);
  }

  return filtered;
}

export function distinctArray<TItem, TKey>(
  array: TItem[],
  selector: (item: TItem) => TKey,
): Set<TKey> {
  return new Set<TKey>([...array.map(selector)]);
}

export function distinctArrayBy<TItem, TKey>(
  array: TItem[],
  selector: (item: TItem) => TKey,
): TItem[] {
  const keys = new Set<TKey>();
  const filtered: TItem[] = [];

  for (const item of array) {
    const key = selector(item);

    if (!keys.has(key)) {
      keys.add(key);
      filtered.push(item);
    }
  }

  return filtered;
}

/**
 * Helper for `*ngFor="let pair of someMap | keyvalue; trackBy:`
 */
export function trackKvpByKey<K, V>(index: number, pair: KeyValue<K, V>): K {
  return pair.key;
}
