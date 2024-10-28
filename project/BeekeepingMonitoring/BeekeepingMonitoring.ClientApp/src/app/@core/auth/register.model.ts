export class RegisterModel implements IRegisterModel {
  email!: string;
  password!: string;

  constructor(data?: IRegisterModel) {
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
      this.password = _data["password"];
    }
  }

  static fromJS(data: any): RegisterModel {
    data = typeof data === 'object' ? data : {};
    let result = new RegisterModel();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["email"] = this.email;
    data["password"] = this.password;
    return data;
  }
}

export interface IRegisterModel {
  email: string;
  password: string;
}
