import {Directive, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MainSegmentLayoutService} from "./main-segment-layout.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Directive({
  selector: '[appMainSegmentLayoutDirective]',
  standalone: true,
})
export class MainSegmentLayoutDirective implements OnInit{
  private readonly layoutService = inject(MainSegmentLayoutService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.layoutService.menuMobileOverlayActive$.next(false);
        }
      });
  }
}
