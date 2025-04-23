import { RestSessions } from "./Sessions";

export type RestOptions = {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export type FetchOptions = RequestInit & { url: string; timeout?: number; responseType: "JSON" | "ArrayBuffer" | "Text" };

export type FetchResponse<T extends any> = {
  data: T;
  ok: boolean;
  url: string;
  redirected: boolean;
  status: number;
  statusText: string;
  headers: Headers;
}

export type APIResponse<T extends any> = {
  ok: boolean;
  content: T;
  error?: {
    type: string;
    code: string;
    content: string;
  }
}

export class Rest {
  sessions = new RestSessions(this);
  constructor(public options: RestOptions) { }

  async fetch(options: FetchOptions): Promise<FetchResponse<any>> {
    if (!options.url.startsWith('http'))
      options.url = this.options.baseUrl + options.url;

    options.headers = { ...(this.options.headers || {}), ...(options.headers || {}) };
    options.method ||= 'GET';
    options.timeout ||= this.options.timeout;

    const controller = new AbortController();
    const signal = controller.signal;
    let timeout: any = null;

    if (options.timeout) {
      timeout = setTimeout(() => {
        controller.abort(new Error('Request timed out'));
      }, options.timeout);
    }

    const req = await fetch(options.url, { ...options, signal });
    const res = await (() => {
      switch (options.responseType) {
        case 'JSON':
          return req.json();
        case 'ArrayBuffer':
          return req.arrayBuffer();
        case 'Text':
          return req.text();
        default:
          return req.json();
      }
    })();

    if (timeout) clearTimeout(timeout);

    return {
      data: res,
      ok: req.ok,
      url: req.url,
      redirected: req.redirected,
      status: req.status,
      statusText: req.statusText,
      headers: req.headers
    }
  }


}