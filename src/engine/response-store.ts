import { HttpResponse } from '../types/index.js';
import { extractBodyValue } from './assertion-runner.js';

export class ResponseStore {
  private store = new Map<string, HttpResponse>();

  public set(requestName: string, response: HttpResponse) {
    this.store.set(requestName, response);
  }

  public get(requestName: string): HttpResponse | undefined {
    return this.store.get(requestName);
  }

  public clear() {
    this.store.clear();
  }

  public getValue(path: string): any {
    // path format: requestName.response.field[.subfield]
    // e.g. login.response.status
    // e.g. login.response.body.user.token
    const match = path.match(/^([^.]+)\.response\.(.+)$/);
    if (!match) return undefined;

    const [_, reqName, fieldPath] = match;
    const res = this.get(reqName);
    if (!res) return undefined;

    if (fieldPath === 'status') return res.status;
    if (fieldPath === 'latency') return res.latency;
    
    if (fieldPath.startsWith('body')) {
      const subPath = fieldPath.substring(5); // remove 'body.'
      if (!subPath) return res.body;
      return extractBodyValue(res.body, subPath);
    }
    
    if (fieldPath.startsWith('headers.')) {
      const headerName = fieldPath.substring(8);
      return res.headers[headerName] || res.headers[headerName.toLowerCase()];
    }

    return undefined;
  }
}
