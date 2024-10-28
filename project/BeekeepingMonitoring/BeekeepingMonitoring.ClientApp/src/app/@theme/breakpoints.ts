// Keep in sync with node_modules/primeflex/src/_variables.scss

import {inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {Observable} from "rxjs";
import {mediaMatches$} from "../@shared/utils/rxjs-operators";

export enum ViewpointBreakpoint {
  Small,
  Medium,
  Large,
  ExtraLarge,
}

/**
 * Values are in pixels
 */
export const breakpointMinWidths: { [breakpoint in ViewpointBreakpoint]: number} = {
  [ViewpointBreakpoint.Small]: 576,
  [ViewpointBreakpoint.Medium]: 768,
  [ViewpointBreakpoint.Large]: 992,
  [ViewpointBreakpoint.ExtraLarge]: 1200,
};

@Injectable({
  providedIn: 'root', // This might need to be changed at some point
})
export class BreakpointsService {
  private readonly document = inject(DOCUMENT);

  private get window(): Window {
    return this.document.defaultView!;
  }

  public currentlyMatches$(breakpoint: ViewpointBreakpoint): Observable<boolean> {
    return mediaMatches$(
      this.window,
      `screen and (min-width: ${breakpointMinWidths[breakpoint]}px)`,
    );
  }
}
