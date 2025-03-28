import {Injectable} from '@angular/core';
import {CommonToastsService} from "./common-toasts.service";
import {TranslocoService} from "@ngneat/transloco";
import {MonoTypeOperatorFunction, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PredefinedToastsService {
  constructor(
    private readonly commonToasts: CommonToastsService,
    private readonly translocoService: TranslocoService,
  ) {
  }

  public internalError(): void {
    this.commonToasts.showBasicError({
      summary: this.translocoService.translate('toasts.internal_error.header'),
      detail: this.translocoService.translate('toasts.internal_error.details'),
    });
  }

  /**
   * Pipe an observable through this to automatically trigger internalError
   * toast on every error notification in the rx pipeline.
   */
  public internalErrorRxMonitor<T>(): MonoTypeOperatorFunction<T> {
    return source => source
      .pipe(
        tap({
          error: () => {
            this.internalError();
          },
        }),
      );
  }
}
