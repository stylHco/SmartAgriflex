import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressBarModule} from "primeng/progressbar";
import {Router} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {autoMarkForCheck} from "../@shared/utils/change-detection-helpers";

@UntilDestroy()
@Component({
  selector: 'app-router-indicator',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
  ],
  templateUrl: './router-indicator.component.html',
  styleUrls: ['./router-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterIndicatorComponent implements OnInit {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  protected get show(): boolean {
    return !this.router.navigated || // Have not completed initial navigation yet (poor man's startup indicator)
      !!this.router.getCurrentNavigation(); // There is an active navigation
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        untilDestroyed(this),
        autoMarkForCheck(this.cd),
      )
      .subscribe();
  }
}
