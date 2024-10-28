import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BehaviorSubject, concat, defer, EMPTY, Observable, of} from "rxjs";
import {
  catchError,
  filter,
  map, tap
} from "rxjs/operators";
import {Inject, Injectable} from "@angular/core";
import {AuthStatus, IAuthStatus} from "./auth-status";
import {API_BASE} from "../../app-constants";
import {LoginModel} from "./login.model";
import {ISignInResult, SignInResult} from "./sign-in-result.model";
import {RegisterModel} from "./register.model";
import {IdentityResult, IIdentityResult} from "./identity-result.model";
import {RequestPasswordResetModel} from "./request-password-reset.model";
import {ConfirmEmailModel} from "./confirm-email.model";
import {CompletePasswordResetModel} from "./complete-password-reset.model";
import {ResendEmailConfirmationModel} from "./resend-email-confirmation.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private statusIsLoading = false;
  private statusSubject$ = new BehaviorSubject<AuthStatus|undefined>(undefined);

  private statusFiltered$ = <Observable<AuthStatus>> this.statusSubject$
    .pipe(
      filter(value => !!value),
    );

  public readonly status$: Observable<AuthStatus> = defer(() => {
    if (this.statusIsLoading) return this.statusFiltered$;

    return concat(
      this.getStatusForceLatest()
        .pipe(
          filter(value => false), // We don't care about the value, just want to wait till it completes
          catchError(err => EMPTY), // If we fail, still return this.statusFiltered$
        ),
      this.statusFiltered$,
    )
  });

  constructor(
    private httpClient: HttpClient,
    @Inject(API_BASE) private apiBase: string,
  ) {
  }

  get authStatusUrl(): string {
    return this.apiBase + 'auth/status';
  }

  /**
   * Returns the status if there is one cached, or fetches it from server
   */
  getStatus(): Observable<AuthStatus> {
    if (this.statusSubject$.value) return of(this.statusSubject$.value);

    return this.getStatusForceLatest();
  }

  /**
   * Gets the latest status from API, bypassing the service cache
   */
  getStatusForceLatest(): Observable<AuthStatus> {
    this.statusIsLoading = true;

    return this.getStatusForceLatestPure()
      .pipe(
        tap(value => this.statusSubject$.next(value)),
      );
  }

  /**
   * Same as getStatusForceLatest but doesn't emit status$
   */
  getStatusForceLatestPure(): Observable<AuthStatus> {
    return this.httpClient.get<IAuthStatus>(this.authStatusUrl)
      .pipe(
        map(value => AuthStatus.fromJS(value))
      );
  }

  /**
   * Clear out the existing cached status and request the new one from the API
   */
  private forceRefreshStatus() {
    this.statusSubject$.next(undefined);
    this.getStatusForceLatest().subscribe();
  }

  public login(model: LoginModel): Observable<SignInResult> {
    return this.httpClient.post<ISignInResult>(this.apiBase + 'auth/login', model)
      .pipe(
        tap(() => this.forceRefreshStatus()),
        map(apiResult => SignInResult.fromJS(apiResult)),
      );
  }

  public logout(): Observable<void> {
    return this.httpClient.post<void>(this.apiBase + 'auth/logout', undefined)
      .pipe(
        tap({
          next: () => this.forceRefreshStatus(),
          error: (error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.forceRefreshStatus();
              // TODO: Would be nice to inform other tabs of this. Check how the default template does that
            }
          },
        }),
      );
  }

  public register(model: RegisterModel): Observable<IdentityResult> {
    return this.httpClient.post<IIdentityResult>(this.apiBase + 'auth/register', model)
      .pipe(
        map(apiResult => IdentityResult.fromJS(apiResult)),
      );
  }

  public confirmEmail(model: ConfirmEmailModel): Observable<boolean> {
    return this.httpClient.post<boolean>(this.apiBase + 'auth/confirm-email', model);
  }

  public resendEmailConfirmation(model: ResendEmailConfirmationModel): Observable<void> {
    return this.httpClient.post<void>(this.apiBase + 'auth/resend-email-confirmation', model);
  }

  public requestPasswordReset(model: RequestPasswordResetModel): Observable<void> {
    return this.httpClient.post<void>(this.apiBase + 'auth/request-password-reset', model);
  }

  public completePasswordReset(model: CompletePasswordResetModel): Observable<IdentityResult> {
    return this.httpClient.post<IIdentityResult>(this.apiBase + 'auth/complete-password-reset', model)
      .pipe(
        map(apiResult => IdentityResult.fromJS(apiResult)),
      );
  }
}
