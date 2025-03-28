export class ResendEmailConfirmationModel implements IResendEmailConfirmationModel {
  email!: string;

  constructor(data?: IResendEmailConfirmationModel) {
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

  static fromJS(data: any): ResendEmailConfirmationModel {
    data = typeof data === 'object' ? data : {};
    let result = new ResendEmailConfirmationModel();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["email"] = this.email;
    return data;
  }
}

export interface IResendEmailConfirmationModel {
  email: string;
}
