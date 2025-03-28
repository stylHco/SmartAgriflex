import {forwardRef, inject, Injectable} from '@angular/core';
import {MainSegmentModule} from "../main-segment.module";
import {BehaviorSubject} from "rxjs";
import {BreakpointsService, ViewpointBreakpoint} from "../../@theme/breakpoints";

@Injectable({
  providedIn: forwardRef(() => MainSegmentModule),
})
export class MainSegmentLayoutService {
  private readonly breakpointsService = inject(BreakpointsService);

  public readonly currentlyDesktop$ = this.breakpointsService
    .currentlyMatches$(ViewpointBreakpoint.Large);

  public readonly menuMobileOverlayActive$ = new BehaviorSubject<boolean>(false);
  public readonly menuDesktopHidden$ = new BehaviorSubject<boolean>(false);

  public readonly clicksInsideRetainMobileMenu: Node[] = [];
}
