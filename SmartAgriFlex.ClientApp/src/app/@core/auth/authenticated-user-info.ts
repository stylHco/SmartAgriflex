export class AuthenticatedUserInfo implements IAuthenticatedUserInfo {
  email!: string;

  constructor(data?: IAuthenticatedUserInfo) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.email = _data["email"];
    }
  }

  static fromJS(data: any): AuthenticatedUserInfo {
    data = typeof data === 'object' ? data : {};
    let result = new AuthenticatedUserInfo();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["email"] = this.email;
    return data;
  }
}

export interface IAuthenticatedUserInfo {
  email: string;
}
