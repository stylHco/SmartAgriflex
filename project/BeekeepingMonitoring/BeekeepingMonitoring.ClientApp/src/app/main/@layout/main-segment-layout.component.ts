import {Component, HostListener, inject, OnInit} from '@angular/core';
import {MainSegmentLayoutService} from "./main-segment-layout.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'app-main-segment-layout',
  templateUrl: './main-segment-layout.component.html',
  styleUrls: ['./main-segment-layout.component.scss']
})
export class MainSegmentLayoutComponent implements OnInit {
  private readonly layoutService = inject(MainSegmentLayoutService);

  private currentlyDesktop = true;

  ngOnInit(): void {
    this.layoutService.currentlyDesktop$
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(value => this.currentlyDesktop = value);
  }

  get containerClass() {
    return {
      'layout-static-inactive': this.layoutService.menuDesktopHidden$.value,
      'layout-mobile-active': this.layoutService.menuMobileOverlayActive$.value,
    };
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick($event: Event): void {
    if (!$event.target) return;

    if (this.currentlyDesktop) return;
    if (this._shouldRetainMobileMenu($event.target as Node)) return;

    this.layoutService.menuMobileOverlayActive$.next(false);
  }

  private _shouldRetainMobileMenu(target: Node): boolean {
    return this.layoutService.clicksInsideRetainMobileMenu
      .some(t => t.isSameNode(target) || t.contains(target));
  }
}
