import {Injectable} from '@angular/core';
import {combineLatest, map, Observable, of, Subject, takeUntil} from "rxjs";
import {createDisposeSubjectForRoot} from "./am-utils";
import {Root, Theme} from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import {whereNotUndefined} from "../utils/collection.helpers";
import {distinctUntilChanged} from "rxjs/operators";
import {ThemingService} from "../../@theme/management/theming.service";
import {AppTheme} from "../../@theme/theme.enum";

const animatedThemeFactory = (root: Root) => am5themes_Animated.new(root);
const darkThemeFactory = (root: Root) => am5themes_Dark.new(root);

@Injectable({
  providedIn: 'root'
})
export class AmChartThemerService {
  constructor(
    private readonly themingService: ThemingService,
  ) {
  }

  public applyThemer(root: Root): AmChartThemer {
    return new AmChartThemer(
      root,
      this.themingService.activeTheme$
        .pipe(
          map(theme => theme === AppTheme.Dark),
        ),
    );
  }
}

// Grow this as required, e.g. add options for before/after colour scheme/animated
export class AmChartThemer {
  private readonly chartDisposedSubject: Subject<void>;

  private readonly conditionalAnimatedTheme: ConditionalAmTheme;
  private readonly conditionalDarkTheme: ConditionalAmTheme;

  constructor(
    public readonly root: Root,
    enableDarkTheme$: Observable<boolean>,
  ) {
    this.chartDisposedSubject = createDisposeSubjectForRoot(this.root);

    this.conditionalAnimatedTheme = new ConditionalAmTheme(this.root, animatedThemeFactory, of(true));
    this.conditionalDarkTheme = new ConditionalAmTheme(this.root, darkThemeFactory, enableDarkTheme$);

    combineLatest([
      this.conditionalAnimatedTheme.themeInstance$,
      this.conditionalDarkTheme.themeInstance$,
    ])
      .pipe(
        takeUntil(this.chartDisposedSubject),
      )
      .subscribe(themes => {
        this.root.setThemes(whereNotUndefined(themes));
      });
  }
}

export class ConditionalAmTheme {
  private _themeInstance?: Theme;

  /**
   *
   * @param root
   * @param themeFactory
   * @param shouldApply$ Must emit instantly as subscribed
   */
  constructor(
    private readonly root: Root,
    private readonly themeFactory: (root: Root) => Theme,
    private readonly shouldApply$: Observable<boolean>,
  ) {
  }

  public readonly themeInstance$: Observable<Theme|undefined> = this.shouldApply$
    .pipe(
      distinctUntilChanged(),
      map(shouldApply => shouldApply ? this.getThemeInstance() : undefined),
    );

  private getThemeInstance(): Theme {
    if (!this._themeInstance) {
      this._themeInstance = this.themeFactory(this.root);
    }

    return this._themeInstance;
  }
}

