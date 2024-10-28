import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {BehaviorSubject, map, of, switchMap} from "rxjs";
import {ThemeSelection} from "../theme-selection.enum";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {changeableFromBehaviourSubject} from "../../@shared/utils/changeable";
import {AppTheme} from "../theme.enum";
import {mediaMatches$} from "../../@shared/utils/rxjs-operators";
import {distinctUntilChanged} from "rxjs/operators";

@UntilDestroy()
@Injectable()
export class ThemingService {
  private readonly _selectionSubject = new BehaviorSubject<ThemeSelection>(ThemeSelection.System);

  public readonly activeSelection = changeableFromBehaviourSubject(this._selectionSubject);

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    // Note: cannot inject the renderer here
  ) {
  }

  private readonly systemTheme$ = mediaMatches$(
    this.document.defaultView!,
    "(prefers-color-scheme: dark)"
  )
    .pipe(
      map(matches => matches ? AppTheme.Dark : AppTheme.Light),
    )

  public readonly activeTheme$ = this._selectionSubject
    .pipe(
      switchMap(selection => {
        switch (selection) {
          case ThemeSelection.Light:
            return of(AppTheme.Light);
          case ThemeSelection.Dark:
            return of(AppTheme.Dark);

          case ThemeSelection.System:
            return this.systemTheme$;
        }
      }),
      distinctUntilChanged(),
    );

  init(): void {
    this._selectionSubject
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(selection => {
        this.document.documentElement.setAttribute(
          'data-theme-selection',
          selectionToAttributeString(selection),
        );
      });

    const storedSelection = localStorage.getItem(localStorageKey);
    if (storedSelection && storedSelection in ThemeSelection) {
      // @ts-ignore
      this.setSelectionNoPersist(ThemeSelection[storedSelection]);
    }
  }

  public setSelection(newSelection: ThemeSelection): void {
    this.setSelectionNoPersist(newSelection);
    localStorage.setItem(localStorageKey, ThemeSelection[newSelection]);
  }

  private setSelectionNoPersist(newSelection: ThemeSelection) {
    this._selectionSubject.next(newSelection);
  }
}

const localStorageKey = 'beekeeping-monitoring-theme-selection';

function selectionToAttributeString(selection: ThemeSelection): string {
  switch (selection) {
    case ThemeSelection.System:
      return 'system';

    case ThemeSelection.Light:
      return 'light';

    case ThemeSelection.Dark:
      return 'dark';
  }
}
