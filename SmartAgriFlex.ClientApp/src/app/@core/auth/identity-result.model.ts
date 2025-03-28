export class IdentityResult implements IIdentityResult {
  succeeded!: boolean;
  errors?: IdentityError[] | undefined;

  constructor(data?: IIdentityResult) {
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
      if (Array.isArray(_data["errors"])) {
        this.errors = [] as any;
        for (let item of _data["errors"])
          this.errors!.push(IdentityError.fromJS(item));
      }
    }
  }

  static fromJS(data: any): IdentityResult {
    data = typeof data === 'object' ? data : {};
    let result = new IdentityResult();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["succeeded"] = this.succeeded;
    if (Array.isArray(this.errors)) {
      data["errors"] = [];
      for (let item of this.errors)
        data["errors"].push(item.toJSON());
    }
    return data;
  }
}

export interface IIdentityResult {
  succeeded: boolean;
  errors?: IIdentityError[] | undefined;
}

export class IdentityError implements IIdentityError {
  code?: string | undefined;
  description?: string | undefined;

  constructor(data?: IIdentityError) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.code = _data["code"];
      this.description = _data["description"];
    }
  }

  static fromJS(data: any): IdentityError {
    data = typeof data === 'object' ? data : {};
    let result = new IdentityError();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["code"] = this.code;
    data["description"] = this.description;
    return data;
  }
}

export interface IIdentityError {
  code?: string | undefined;
  description?: string | undefined;
}
