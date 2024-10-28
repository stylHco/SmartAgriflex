export class CompletePasswordResetModel implements ICompletePasswordResetModel {
  email!: string;
  code!: string;
  password!: string;

  constructor(data?: ICompletePasswordResetModel) {
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
      this.code = _data["code"];
      this.password = _data["password"];
    }
  }

  static fromJS(data: any): CompletePasswordResetModel {
    data = typeof data === 'object' ? data : {};
    let result = new CompletePasswordResetModel();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["email"] = this.email;
    data["code"] = this.code;
    data["password"] = this.password;
    return data;
  }
}

export interface ICompletePasswordResetModel {
  email: string;
  code: string;
  password: string;
}
