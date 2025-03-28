import {combineLatest, map, Observable} from "rxjs";
import {Changeable} from "./changeable";

export type RepresentingOption<TId, TEntry = never> = {
  id: TId,
  label: string,
  entry: TEntry,
};

export function getRepresentingOptions$<TEntry, TId>(
  entries: TEntry[],
  labelProvider: (entry: TEntry) => Changeable<string>,
  idProvider: (entry: TEntry) => TId,
): Observable<RepresentingOption<TId, TEntry>[]> {
  const optionSources = entries
    .map(entry => {
      return labelProvider(entry).value$
        .pipe(
          map((label): RepresentingOption<TId, TEntry> => ({
            label: label,
            id: idProvider(entry),
            entry: entry,
          })),
        );
    });

  return combineLatest(optionSources);
}
