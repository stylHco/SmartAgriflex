import {HttpErrorResponse} from "@angular/common/http";
import {catchError, map, Observable, of, OperatorFunction} from "rxjs";
import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from "@angular/router";
import {ApiException} from "../../@core/app-api";

export type ApiResultError = HttpErrorResponse | ApiException | Error;

export class ApiResult<TSuccessValue> {
  public readonly value?: TSuccessValue;
  public readonly error?: ApiResultError;

  private constructor(
    response?: TSuccessValue,
    errorResponse?: ApiResultError,
  ) {
    this.error = errorResponse;
    this.value = response;

    if (this.isSuccess === this.isFail) {
      throw new Error("Bad input to ApiResult");
    }
  }

  public static forSuccess<TSuccessValue>(value: TSuccessValue): ApiResult<TSuccessValue> {
    return new ApiResult<TSuccessValue>(value);
  }

  public static forError<TSuccessValue = any>(error: ApiResultError): ApiResult<TSuccessValue> {
    return new ApiResult<TSuccessValue>(undefined, error);
  }

  get isSuccess(): boolean {
    return !!this.value;
  }

  get isFail(): boolean {
    return !!this.error;
  }

  get isNotFound(): boolean {
    return this.isHttpStatusFail() && this.error.status === 404;
  }

  // The below 3 are not used right now, but if we ever end up using them,
  // we will need to update them to the new error typing.

  // get isJsRuntimeError(): boolean {
  //   return this.isFail && this.error!.error instanceof ErrorEvent;
  // }

  // get isServerError(): boolean {
  //   return this.isFail && !this.isJsRuntimeError && this.error!.error >= 500 && this.error!.error < 600;
  // }

  // get isInternalFail(): boolean {
  //   return this.isJsRuntimeError || this.isServerError;
  // }

  private isHttpStatusFail(this: ApiResult<any>): this is ApiResultHttpStatusFail {
    return this.error instanceof HttpErrorResponse || this.error instanceof ApiException;
  }
}

type ApiResultHttpStatusFail = {
  readonly error: {
    readonly status: number,
  };
};

export function asApiResult<TSuccessValue>(): OperatorFunction<TSuccessValue, ApiResult<TSuccessValue>> {
  return function (source: Observable<TSuccessValue>) {

    return source
      .pipe(
        map(value => ApiResult.forSuccess(value)),
        catchError(error => {
          return of(ApiResult.forError(error));
        }),
      );

  }
}

/**
 * Wraps a ResolveFn to wrap its result in a ApiResult.
 *
 * Note that currently only the observable-returning ResolveFns are supported (not the promise and value ones).
 */
export function wrapResolverApiResult<TSuccessValue>(
  innerResolver: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => Observable<TSuccessValue>,
)
  : ResolveFn<ApiResult<TSuccessValue>> {
  return (route, state) => {
    return innerResolver(route, state)
      .pipe(
        asApiResult(),
      );
  };
}
