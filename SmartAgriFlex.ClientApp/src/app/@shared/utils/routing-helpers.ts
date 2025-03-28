import {UrlMatcher} from "@angular/router";

export type RouterNavCommands = string | any[];

export enum RouteReuseMode {
  /**
   * Permit if route has children
   */
  Default,

  Forbid,
  Permit,
}

/**
 * Value must be of type RouteReuseMode
 */
export const REUSE_MODE_KEY = '__REUSE_MODE';

export function matchSingleOptionalParam(paramName: string): UrlMatcher {
  return segments => {
    // No param specified
    if (segments.length === 0) {
      return {
        consumed: [],
      };
    }

    // Param specified
    return {
      consumed: [segments[0]],
      posParams: {
        [paramName]: segments[0],
      },
    };
  };
}
