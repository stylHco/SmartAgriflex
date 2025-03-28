export class SignInResult implements ISignInResult {
  succeeded!: boolean;
  isLockedOut!: boolean;
  isNotAllowed!: boolean;
  requiresTwoFactor!: boolean;

  constructor(data?: ISignInResult) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.succeeded = _data["succeeded"];
      this.isLockedOut = _data["isLockedOut"];
      this.isNotAllowed = _data["isNotAllowed"];
      this.requiresTwoFactor = _data["requiresTwoFactor"];
    }
  }

  static fromJS(data: any): SignInResult {
    data = typeof data === 'object' ? data : {};
    let result = new SignInResult();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["succeeded"] = this.succeeded;
    data["isLockedOut"] = this.isLockedOut;
    data["isNotAllowed"] = this.isNotAllowed;
    data["requiresTwoFactor"] = this.requiresTwoFactor;
    return data;
  }
}

export interface ISignInResult {
  succeeded: boolean;
  isLockedOut: boolean;
  isNotAllowed: boolean;
  requiresTwoFactor: boolean;
}
