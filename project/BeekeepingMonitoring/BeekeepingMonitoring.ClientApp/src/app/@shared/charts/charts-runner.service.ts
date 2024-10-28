import {Inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class ChartsRunnerService {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly zone: NgZone,
  ) {
  }

  /**
   * Runs the provided delegate outside of angular zone and only if we are currently in a browser
   */
  public do(delegate: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        delegate();
      });
    }
  }
}
