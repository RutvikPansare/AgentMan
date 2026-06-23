import { describe, it, expect, beforeEach } from 'vitest';
import { ResponseStore } from './response-store.js';
import { HttpResponse } from '../types/index.js';

describe('ResponseStore', () => {
  let store: ResponseStore;

  beforeEach(() => {
    store = new ResponseStore();
  });

  it('should store and retrieve responses', () => {
    const res: HttpResponse = { status: 200, latency: 10, headers: { 'x-test': '1' }, body: { id: 123 }, timestamp: new Date().toISOString() };
    store.set('req1', res);
    
    expect(store.get('req1')).toBe(res);
    expect(store.get('req2')).toBeUndefined();
  });

  it('should resolve body paths', () => {
    const res: HttpResponse = { status: 200, latency: 10, headers: {}, body: { user: { token: 'abc' } }, timestamp: new Date().toISOString() };
    store.set('login', res);

    expect(store.getValue('login.response.status')).toBe(200);
    expect(store.getValue('login.response.body.user.token')).toBe('abc');
    expect(store.getValue('login.response.headers')).toBeUndefined(); // Only body and status exposed via paths for now, or maybe headers too?
    expect(store.getValue('missing.response.status')).toBeUndefined();
  });
});
