import {AuthenticatedUserInfo} from "./authenticated-user-info";

export interface IAuthStatus {
  user?: AuthenticatedUserInfo | undefined;
  isLoggedIn: boolean;
}

export class AuthStatus implements IAuthStatus {
  user?: AuthenticatedUserInfo | undefined;
  isLoggedIn!: boolean;

  constructor(data?: IAuthStatus) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.user = _data["user"] ? AuthenticatedUserInfo.fromJS(_data["user"]) : <any>undefined;
      this.isLoggedIn = _data["isLoggedIn"];
    }
  }

  static fromJS(data: any): AuthStatus {
    data = typeof data === 'object' ? data : {};
    let result = new AuthStatus();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["user"] = this.user ? this.user.toJSON() : <any>undefined;
    data["isLoggedIn"] = this.isLoggedIn;
    return data;
  }
}
