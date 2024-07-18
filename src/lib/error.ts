export class RequestError extends Error {
  public response: any;

  constructor(message: string, response: any) {
    super(message);
    this.name = 'RequestError';
    this.response = response;
  }
}

export class CancelError extends Error {
  constructor() {
    super('User aborted');
    this.name = 'CancelError';
  }
}

export class JsonDataError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'JsonDataError';
  }
}
