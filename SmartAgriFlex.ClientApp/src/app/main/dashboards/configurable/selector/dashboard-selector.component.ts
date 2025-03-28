import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardNavigator} from "../dashboard-navigator";
import {DialogModule} from "primeng/dialog";
import {
  LoadablesTemplateUtilsModule
} from "../../../../@shared/loadables/template-utils/loadables-template-utils.module";
import {ButtonModule} from "primeng/button";
import {ListBoxDefaultsModule} from "../../../../@shared/defaults/list-box-defaults";
import {ListboxModule} from "primeng/listbox";
import {LoadableDisplayMediumModule} from "../../../../@shared/loadables/status-display/loadable-display-medium";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {autoMarkForCheck} from "../../../../@shared/utils/change-detection-helpers";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {ConfigurableDashboardsRegistry} from "../../../../@core/dashboard/configurable-dashboards-registry";

@UntilDestroy()
@Component({
  selector: 'app-dashboard-selector',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    LoadablesTemplateUtilsModule,
    ButtonModule,
    ListBoxDefaultsModule,
    ListboxModule,
    LoadableDisplayMediumModule,
    FormsModule,
  ],
  templateUrl: './dashboard-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSelectorComponent implements OnInit {
  protected isVisible = false;

  protected selectedDashboardId: number | null = null;
  protected activeDashboardId: number | null = null;

  constructor(
    protected readonly registry: ConfigurableDashboardsRegistry,
    private readonly activatedRoute: ActivatedRoute,
    private readonly cd: ChangeDetectorRef,
    private readonly navigator: DashboardNavigator,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        autoMarkForCheck(this.cd),
        untilDestroyed(this),
      )
      .subscribe(params => this.activeDashboardId = params['id'] ? +params['id'] : null);
  }

  public show(): void {
    this.isVisible = true;
    this.selectedDashboardId = +this.activatedRoute.snapshot.params['id'];

    this.cd.markForCheck();
  }

  protected get isAlreadyOpen(): boolean {
    return this.selectedDashboardId === this.activeDashboardId;
  }

  protected open(): void {
    this.navigator.navigateToDashboard(this.selectedDashboardId!)
      .then(succeeded => {
        if (succeeded) {
          this.isVisible = false;
        }
      });
  }
}
