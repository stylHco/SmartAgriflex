import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, inject, Input, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {IsActiveMatchOptions, NavigationEnd, Router} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {filter} from "rxjs/operators";
import {autoMarkForCheck} from "../../../@shared/utils/change-detection-helpers";
import {Observable, of, take} from "rxjs";

const defaultRouterMatchOptions: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};

@UntilDestroy()
@Component({
  selector: 'li [appMenuItem]',
  templateUrl: './menu-item.component.html',
  animations: [
    trigger('children', [
      state('collapsed', style({
        height: '0',
      })),
      state('expanded', style({
        height: '*',
      })),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'),
      ),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent implements OnInit {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  @Input()
  public item!: MenuItem;

  @Input()
  @HostBinding('class.layout-root-menuitem')
  public root!: boolean;

  @Input()
  public fallbackRouterMatchOptions: Readonly<IsActiveMatchOptions> = defaultRouterMatchOptions;

  private isExpanded: boolean = false;

  ngOnInit(): void {
    this.router.events
      .pipe(
        untilDestroyed(this),
        filter(event => !!this.item.routerLink && event instanceof NavigationEnd),
        autoMarkForCheck(this.cd),
      )
      .subscribe();

    // This might be slightly overcomplicated, but I don't want to rely on how
    // exactly the router actives components/outlets during the initial navigation.
    // TODO: do we want auto-expand on all navigations? (e.g. navigation without using the menu)
    const evaluateInitialExpand$: Observable<unknown> = this.router.navigated
      ? of(undefined)
      : this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
        );

    evaluateInitialExpand$
      .pipe(
        untilDestroyed(this),
        take(1),
      )
      .subscribe(() => {
        if (!this.isActiveOrChildActiveFromRoute(this.item)) return;

        this.isExpanded = true;
        this.cd.markForCheck();
      });
  }

  private getRouterLinkActiveOptionsForItem(item: MenuItem): IsActiveMatchOptions {
    // Since we pass fallbackRouterMatchOptions as input to the nested/child
    // MenuItemComponents, we can assume here that they are the same for all items
    return item.routerLinkActiveOptions || this.fallbackRouterMatchOptions;
  }

  protected get routerLinkActiveOptions(): IsActiveMatchOptions {
    return this.getRouterLinkActiveOptionsForItem(this.item);
  }

  private isItemActiveFromRoute(item: MenuItem): boolean {
    if (!item.routerLink) return false;

    return this.router.isActive(
      this.router.createUrlTree(coerceArray(item.routerLink)),
      this.getRouterLinkActiveOptionsForItem(item),
    );
  }

  private get isActiveFromRoute(): boolean {
    return this.isItemActiveFromRoute(this.item);
  }

  private isActiveOrChildActiveFromRoute(item: MenuItem): boolean {
    if (this.isItemActiveFromRoute(item)) return true;

    if (item.items) {
      for (const childItem of item.items) {
        if (this.isActiveOrChildActiveFromRoute(childItem)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Important: isExpanded is used for expanding the child menu.
   * Currently there is no support for an item to be both a container and a link.
   *
   * If such functionality is required, UX flow should be redesigned first, e.g.
   * * What happens if user navigates to the route without using the menu (auto-expand/collapse?)
   * * Can the children be expanded without (clicking &) navigating? Make the down arrow a separate button?
   */
  private get isActive(): boolean {
    return this.isExpanded || this.isActiveFromRoute;
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.isActive && !this.root;
  }

  protected get submenuAnimation() {
    if (this.root) {
      return 'expanded';
    }

    return this.isActive ? 'expanded' : 'collapsed';
  }

  protected itemClick(event: Event): void {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item.command) {
      this.item.command({originalEvent: event, item: this.item});
    }

    // toggle active state
    if (this.item.items) {
      this.isExpanded = !this.isExpanded;
    }
  }
}

function coerceArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}
