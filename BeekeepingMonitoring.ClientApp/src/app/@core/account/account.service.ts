import {Inject, Injectable} from '@angular/core';
import {ChangePasswordModel} from "./change-password.model";
import {HttpClient} from "@angular/common/http";
import {API_BASE} from "../../app-constants";
import {Observable} from "rxjs";
import {IdentityResult, IIdentityResult} from "../auth/identity-result.model";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(
    private httpClient: HttpClient,
    @Inject(API_BASE) private apiBase: string,
  ) {
  }

  public changePassword(model: ChangePasswordModel): Observable<IdentityResult> {
    return this.httpClient.post<IIdentityResult>(this.apiBase + 'account/change-password', model)
      .pipe(
        map(apiResult => IdentityResult.fromJS(apiResult)),
      );
  }
}
