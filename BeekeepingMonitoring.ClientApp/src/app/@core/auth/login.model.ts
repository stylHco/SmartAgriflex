export class LoginModel implements ILoginModel {
  username!: string;
  password!: string;
  rememberMe: boolean = false;

  constructor(data?: ILoginModel) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.username = _data["username"];
      this.password = _data["password"];
      this.rememberMe = _data["rememberMe"];
    }
  }

  static fromJS(data: any): LoginModel {
    data = typeof data === 'object' ? data : {};
    let result = new LoginModel();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["username"] = this.username;
    data["password"] = this.password;
    data["rememberMe"] = this.rememberMe;
    return data;
  }
}

export interface ILoginModel {
  username: string;
  password: string;
  rememberMe: boolean;
}
