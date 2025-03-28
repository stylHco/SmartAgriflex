import {TranslocoScope, TranslocoService} from "@ngneat/transloco";
import {ChangeDetectorRef, inject, Injectable, Pipe} from "@angular/core";
import {map, Observable, Subject, takeUntil} from "rxjs";
import {EnumValue, getAllEnumPairs} from "../@shared/utils/enum-utils";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {autoMarkForCheck} from "../@shared/utils/change-detection-helpers";

export interface EnumTranslationSpec<T extends object> {
  enumType: T;

  /**
   * The path that will contains the enum.
   * Expected to an object of [enum keys]: translated value.
   */
  path: string;

  /**
   * Currently not supported - do we even need to?
   */
  scope?: TranslocoScope;
}

export function buildEnumTranslationSpec<T extends object>(enumType: T, path: string): EnumTranslationSpec<T> {
  return {
    enumType: enumType,
    path: path,
  };
}

export function getEnumTranslationKey<T extends object>(spec: EnumTranslationSpec<T>, key: keyof T & string): string {
  return spec.path + '.' + key;
}

export type TranslatedEnumOption<T extends object> = { value: EnumValue<T>, display: string };
export type TranslatedEnumOptions<T extends object> = TranslatedEnumOption<T>[];

@Injectable({
  providedIn: 'root',
})
export class EnumTranslationService {
  private readonly transloco = inject(TranslocoService);

  public selectTranslateOptions<T extends object>(spec: EnumTranslationSpec<T>): Observable<TranslatedEnumOptions<T>> {
    const pairs = getAllEnumPairs(spec.enumType);

    const paths = pairs
      .map(pair => getEnumTranslationKey(spec, pair.key));

    return this.transloco.selectTranslate(paths, undefined, spec.scope)
      .pipe(
        map(function (translatedValues: string[]): TranslatedEnumOptions<T> {
          return translatedValues.map((translatedValue, index) => ({
            value: pairs[index].value,
            display: translatedValue,
          }));
        }),
      );
  }

  public selectTranslateValue<T extends object>(spec: EnumTranslationSpec<T>, value: T): Observable<string> {
    const pairs = getAllEnumPairs(spec.enumType);
    const key = pairs.find(pair => pair.value === value)?.key;

    if (!key) {
      throw 'Unable to find enum key from the value';
    }

    const path = getEnumTranslationKey(spec, key);

    return this.transloco.selectTranslate(path, undefined, spec.scope);
  }
}

@UntilDestroy()
@Pipe({
  name: 'appTranslatedEnumOptions',
  standalone: true,
  pure: false,
})
export class TranslatedEnumOptionsPipe<T extends object> {
  private readonly enumTranslationService = inject(EnumTranslationService);
  private readonly cd = inject(ChangeDetectorRef);

  private readonly switchSpecSubject = new Subject<void>();

  private _currentSpec?: EnumTranslationSpec<T>;
  private _latestOptions?: TranslatedEnumOptions<T>;

  public transform(spec: EnumTranslationSpec<T>): TranslatedEnumOptions<T> {
    if (spec !== this._currentSpec) {
      this.switchSpecSubject.next();

      this._latestOptions = undefined;
      this._currentSpec = spec;

      this.enumTranslationService.selectTranslateOptions(spec)
        .pipe(
          untilDestroyed(this),
          takeUntil(this.switchSpecSubject),
          autoMarkForCheck(this.cd),
        )
        .subscribe(options => this._latestOptions = options);
    }

    // TODO: what should be the behaviour when undefined? Throw?
    return this._latestOptions ?? [];
  }
}

@UntilDestroy()
@Pipe({
  name: 'appTranslateEnum',
  standalone: true,
  pure: false,
})
export class EnumTranslationPipe<T extends object> {
  private readonly enumTranslationService = inject(EnumTranslationService);
  private readonly cd = inject(ChangeDetectorRef);

  private readonly switchInputSubject = new Subject<void>();

  private _currentValue?: T;
  private _currentSpec?: EnumTranslationSpec<T>;

  private _latestTranslation?: string;

  public transform(value: T, spec: EnumTranslationSpec<T>): string {
    if (spec !== this._currentSpec || value !== this._currentValue) {
      this.switchInputSubject.next();

      this._latestTranslation = undefined;

      this._currentValue = value;
      this._currentSpec = spec;

      this.enumTranslationService.selectTranslateValue(spec, value)
        .pipe(
          untilDestroyed(this),
          takeUntil(this.switchInputSubject),
          autoMarkForCheck(this.cd),
        )
        .subscribe(translation => this._latestTranslation = translation);
    }

    // TODO: what should be the behaviour when undefined? Throw?
    return this._latestTranslation ?? '';
  }
}

