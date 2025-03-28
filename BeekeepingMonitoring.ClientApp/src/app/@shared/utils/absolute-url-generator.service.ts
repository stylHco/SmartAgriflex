import {inject, Injectable} from '@angular/core';
import {Location, PlatformLocation} from "@angular/common";
import {Router, UrlCreationOptions} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AbsoluteUrlGeneratorService {
  // Docs day to not use PlatformLocation directly, but I couldn't find any other way to get
  // the values of host, protocol, etc.
  private readonly platformLocation = inject(PlatformLocation);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  public forRouterCommands(commands: any[], navigationExtras?: UrlCreationOptions): string {
    const origin = this.getOrigin();

    const urlTree = this.router.createUrlTree(commands, navigationExtras);
    const serializedUrl = this.router.serializeUrl(urlTree);
    const externalUrl = this.location.prepareExternalUrl(serializedUrl);

    return origin + externalUrl;
  }

  public getOrigin(): string {
    let origin: string = "";

    origin += this.platformLocation.protocol + "//";
    origin += this.platformLocation.hostname;

    if (this.shouldAppendPort()) {
      origin += ':' + this.platformLocation.port;
    }

    return origin;
  }

  private shouldAppendPort() {
    if (this.platformLocation.port === '') return false;

    if (this.platformLocation.port === '80' && this.platformLocation.protocol === 'http:') return false;
    if (this.platformLocation.port === '443' && this.platformLocation.protocol === 'https:') return false;

    return true;
  }
}
