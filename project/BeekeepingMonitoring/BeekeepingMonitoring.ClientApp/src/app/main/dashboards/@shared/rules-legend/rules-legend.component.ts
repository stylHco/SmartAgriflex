import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {CardModule} from "primeng/card";
import {CustomDashboardClient, CustomRulesListModel, DashboardSensorTypeEnum} from "../../../../@core/app-api";
import {ActivatedRoute, } from "@angular/router";
import {EMPTY, Subject, takeUntil} from "rxjs";
import {catchError} from "rxjs/operators";
import {CommonModule} from "@angular/common";
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {Button} from "primeng/button";
import {TRANSLOCO_SCOPE, TranslocoModule, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../../../@transloco/transloco.helpers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-rules/en.json'),
  lang => import(/* webpackChunkName: "rules-i18n" */ `./i18n-rules/${lang}.json`)
);
@Component({
  selector: 'app-rules-legend',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ProgressSpinnerModule,
    Button,
    TranslocoModule
  ],
  templateUrl: "rules-legend.component.html",
  styleUrl: "rules-legend.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'rules', loader: translocoLoader},
    },
  ],
})

export class RulesLegendComponent implements OnInit, OnDestroy {
  @Input()
  sensorType!: DashboardSensorTypeEnum;
  @Input()
  title: string = "Legend";

  isLoading = signal(true);
  hasError = signal(false);

  customRules!: CustomRulesListModel[];
  destroy$ = new Subject<void>();

  constructor(
    private customDashboardClient: CustomDashboardClient,
    private cd: ChangeDetectorRef,
    protected readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData() {

    this.hasError.set(false);

    this.customDashboardClient.getCustomRulesForSensor(this.sensorType).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.cd.markForCheck(); // Manually trigger UI update for error state
        return EMPTY;
      })
    ).subscribe(response => {
      this.customRules = response;
      this.hasError.set(false);
      this.isLoading.set(false);

      this.cd.markForCheck(); // Ensure UI updates for new data
    });
  }


  // Retry logic (only called when the user presses Retry)
  retry() {
    this.fetchData();
  }

}
