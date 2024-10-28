import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from "rxjs/operators";
import {AuthService} from "./auth.service";

@Injectable()
export class AuthStatusInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url === this.authService.authStatusUrl) {
      return next.handle(request);
    }

    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (
            !(error.error instanceof ErrorEvent) &&
            error.status == 401
          ) {
            // Refresh the status
            this.authService.getStatusForceLatest().subscribe();
          }

          return throwError(error);
        })
      )
  }
}
