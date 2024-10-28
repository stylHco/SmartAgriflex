export class ChangePasswordModel implements IChangePasswordModel {
  currentPassword!: string;
  newPassword!: string;

  constructor(data?: IChangePasswordModel) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.currentPassword = _data["currentPassword"];
      this.newPassword = _data["newPassword"];
    }
  }

  static fromJS(data: any): ChangePasswordModel {
    data = typeof data === 'object' ? data : {};
    let result = new ChangePasswordModel();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["currentPassword"] = this.currentPassword;
    data["newPassword"] = this.newPassword;
    return data;
  }
}

export interface IChangePasswordModel {
  currentPassword: string;
  newPassword: string;
}
