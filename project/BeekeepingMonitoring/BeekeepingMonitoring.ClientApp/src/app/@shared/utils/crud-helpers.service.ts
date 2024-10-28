import {Injectable} from '@angular/core';
import {CommonToastsService} from "../common-toasts/common-toasts.service";
import {ManageComponentMode} from "./manage-component-mode.enum";
import {catchError, MonoTypeOperatorFunction, Observable, of, OperatorFunction, tap, throwError} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {TranslocoService} from "@ngneat/transloco";
import {ApiException} from "../../@core/app-api";

@Injectable({
  providedIn: 'root',
})
export class CrudHelpersService {
  constructor(
    private readonly translocoService: TranslocoService,
    private readonly commonToastsService: CommonToastsService,
  ) {
  }

  public handleManageToasts<T>(
    itemName: string,
    mode: ManageComponentMode,
    isDraft?: boolean,
  ): MonoTypeOperatorFunction<T>;
  public handleManageToasts<T>(
    itemNameProvider: (value: T) => string,
    mode: ManageComponentMode,
    isDraft?: boolean,
  ): MonoTypeOperatorFunction<T>;
  handleManageToasts<T>(
    itemNameOrProvider: string | ((value: T) => string),
    mode: ManageComponentMode,
    isDraft?: boolean,
  ): MonoTypeOperatorFunction<T> {
    const that = this;

    const itemNameProvider: (value: T) => string = typeof itemNameOrProvider === 'string'
      ? () => itemNameOrProvider
      : itemNameOrProvider;

    return function (source: Observable<T>) {
      return source
        .pipe(
          tap({
            next: value => {
              that.commonToastsService.showBasicSuccess({
                summary: that.translocoService.translate('toasts.manage.success.header'),
                detail: that.translocoService.translate(
                  getManageSuccessDetailsKey(mode, isDraft),
                  {itemName: itemNameProvider(value)}
                ),
              });
            },
            error: error => {
              if (
                mode === ManageComponentMode.Edit &&
                (
                  (error instanceof HttpErrorResponse && error.status === 409) ||
                  (error instanceof ApiException && error.status === 409)
                )
              ) {
                that.commonToastsService.showBasicError({
                  summary: that.translocoService.translate('toasts.manage.conflict.header'),
                  detail: that.translocoService.translate('toasts.manage.conflict.details'),
                  life: 6000,
                });
                return;
              }

              that.commonToastsService.showBasicError({
                summary: that.translocoService.translate(
                  mode == ManageComponentMode.Add
                    ? 'toasts.manage.fail.header.add'
                    : 'toasts.manage.fail.header.edit'
                ),
                detail: that.translocoService.translate('toasts.internal_error.details'),
                life: 4000,
              });
            },
          }),
        )
    };
  }

  /**
   * Will show common deletion toasts based on the status of the observable.
   * Will also convert http 404 to a success with "already deleted" toast.
   */
  public handleDelete<TSource>(
    itemName: string,
    isDraft?: boolean
  ): OperatorFunction<TSource, TSource | void> {
    const that = this;

    const draftKeyAddition = isDraft ? '_draft' : '';

    return function (source: Observable<TSource>) {
      return source
        .pipe(
          tap(() => {
            that.commonToastsService.showBasicSuccess({
              summary: that.translocoService.translate(`toasts.delete.success${draftKeyAddition}.header`),
              detail: that.translocoService.translate(`toasts.delete.success${draftKeyAddition}.details`, {itemName}),
            });
          }),
          catchError(error => {
            if (isDeletedAlreadyError(error)) {
              that.commonToastsService.showBasicWarning({
                summary: that.translocoService.translate(`toasts.delete.already${draftKeyAddition}.header`),
                detail: that.translocoService.translate(`toasts.delete.already${draftKeyAddition}.details`, {itemName}),
              });
              return of(undefined);
            }

            // TODO: PredefinedToastsService.internalError
            that.commonToastsService.showBasicError({
              summary: that.translocoService.translate('toasts.internal_error.header'),
              detail: that.translocoService.translate('toasts.internal_error.details'),
            });
            return throwError(error);
          }),
        )
    };
  }
}

function getManageSuccessDetailsKey(mode: ManageComponentMode, isDraft?: boolean): string {
  if (isDraft) {
    return  mode == ManageComponentMode.Add
      ? 'toasts.manage.success.details_draft.add'
      : 'toasts.manage.success.details_draft.edit';
  }

  return mode == ManageComponentMode.Add
    ? 'toasts.manage.success.details.add'
    : 'toasts.manage.success.details.edit';
}

function isDeletedAlreadyError(error: unknown): boolean {
  if (
    error instanceof HttpErrorResponse &&
    !(error.error instanceof ErrorEvent) &&
    error.status === 404
  ) {
    return true;
  }

  if (
    error instanceof ApiException &&
    error.status === 404
  ) {
    return true;
  }

  return false;
}
