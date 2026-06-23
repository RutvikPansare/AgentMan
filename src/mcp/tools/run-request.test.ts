import { describe, it, expect, vi } from 'vitest';
import { definition, handler } from './run-request.js';

describe('run-request', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('run_request');
  });

  it('should run request and cache response', async () => {
    const mockContext: any = {
      collectionManager: {
        getRequest: async () => ({ name: 'Req1', method: 'GET', url: 'http://foo' })
      },
      environmentManager: { getActiveEnvironment: async () => null },
      authManager: { getProfile: async () => null },
      executeRequest: async () => ({ status: 200 }),
      lastResponseCache: new Map()
    };
    const res = await handler({ collectionName: 'C', requestName: 'Req1' }, mockContext);
    expect(res.content[0].text).toContain('200');
    expect(mockContext.lastResponseCache.get('Req1')).toEqual({ status: 200 });
  });
});
