export class ConfirmEmailModel implements IConfirmEmailModel {
  email!: string;
  code!: string;

  constructor(data?: IConfirmEmailModel) {
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
    }
  }

  static fromJS(data: any): ConfirmEmailModel {
    data = typeof data === 'object' ? data : {};
    let result = new ConfirmEmailModel();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["email"] = this.email;
    data["code"] = this.code;
    return data;
  }
}

export interface IConfirmEmailModel {
  email: string;
  code: string;
}
