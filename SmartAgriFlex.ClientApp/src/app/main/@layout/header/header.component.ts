import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../@core/auth/auth.service";
import {SubscriptionsCounter} from "../../../@shared/utils/subscriptions-counter";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {Router} from "@angular/router";
import {CommonToastsService} from "../../../@shared/common-toasts/common-toasts.service";
import {HttpErrorResponse} from "@angular/common/http";
import {map} from 'rxjs/operators';
import {Observable} from "rxjs";
import {MainSegmentLayoutService} from "../main-segment-layout.service";

@UntilDestroy()
@Component({
  selector: 'app-main-segment-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class MainSegmentHeaderComponent implements OnInit {
  logoutMonitor = new SubscriptionsCounter();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly commonToasts: CommonToastsService,
    private readonly layoutService: MainSegmentLayoutService,
  ) {
  }

  userName$: Observable<string|undefined> = this.authService.status$
    .pipe(
      map(status => status.user?.email),
    );

  private currentlyDesktop = true;

  ngOnInit(): void {
    this.layoutService.currentlyDesktop$
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(value => this.currentlyDesktop = value);
  }

  protected toggleMenu(): void {
    const subject = this.currentlyDesktop
      ? this.layoutService.menuDesktopHidden$
      : this.layoutService.menuMobileOverlayActive$;

    subject.next(!subject.value);
  }

  // TODO: loc the toasts
  logout(): void {
    this.authService.logout()
      .pipe(
        this.logoutMonitor.monitor({decrementOnlyOnError: true}),
        untilDestroyed(this),
      )
      .subscribe({
        next: async () => {
          await this.router.navigateByUrl('/auth/login');
          this.commonToasts.showBasicSuccess({
            summary: 'Logged out',
          });
        },
        error: async error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            await this.router.navigateByUrl('/auth/login');
            this.commonToasts.showBasicWarning({
              summary: 'Logged out',
              detail: 'You were already logged out',
            });
            return;
          }

          this.commonToasts.showBasicError({
            summary: 'Something went wrong',
          });
        },
      });
  }
}
