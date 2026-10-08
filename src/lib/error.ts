export class RequestError extends Error {
  public url: string;
  public status: number;

  constructor(url: string, status: number) {
    super(status + ' ' + url);
    this.name = 'RequestError';
    this.url = url;
    this.status = status;
  }
}

// Safari 平台的脚本管理器无法为 GM_xmlhttpRequest 设置 Referer 等特殊请求头，
// 依赖 Referer 鉴权的图床（如 i.pximg.net）会因此返回 403。
export class SafariRefererError extends Error {
  public url: string;
  public status: number;

  constructor(url: string, status: number) {
    super(
      `HTTP ${status}: Safari cannot send the Referer header required by the image server. ` +
        `Please try Chrome / Edge / Firefox. (${url})`
    );
    this.name = 'SafariRefererError';
    this.url = url;
    this.status = status;
  }
}

export class CancelError extends Error {
  constructor() {
    super('User aborted.');
    this.name = 'CancelError';
  }
}

export class JsonDataError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'JsonDataError';
  }
}

export class TimoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'TimoutError';
  }
}

export class PermissionError extends Error {
  constructor() {
    super('Permission denied.');
    this.name = 'PermissionError';
  }
}

export class InvalidPostError extends Error {
  constructor(id: string) {
    super(`Invalid post id: ${id}.`);
    this.name = 'InvalidPostError';
  }
}
