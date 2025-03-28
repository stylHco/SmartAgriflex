import {map, Observable, OperatorFunction} from "rxjs";

export class PageTitleDef {
  static readonly DEFAULT = new PageTitleDef();

  readonly localTitle?: string;
  readonly appendSuffix: boolean = true;

  constructor(init?: Partial<PageTitleDef>) {
    Object.assign(this, init);
  }

  get isProjectTitleOnly() {
    return !this.localTitle;
  }
}

/**
 * Converts an observable of `string`s to observable of `PageTitleDef`s, with the source
 * string becoming the local title. Simple helper for a common use case.
 */
export function mapToLocalPageTitle(): OperatorFunction<string, PageTitleDef> {
  return function (source: Observable<string>): Observable<PageTitleDef> {
    return source
      .pipe(
        map(value => new PageTitleDef({localTitle: value})),
      );
  }
}
