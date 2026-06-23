import { describe, it, expect } from 'vitest';
import { definition, handler } from './create-request.js';

describe('create-request', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('create_request');
  });

  it('should return successful result', async () => {
    const mockContext: any = {
      collectionManager: {
        addRequest: async () => {}
      }
    };
    const res = await handler({ collectionName: 'C1', request: { id: '1', name: 'R1', method: 'GET', url: 'http://foo' } }, mockContext);
    expect(res.content[0].text).toContain('true');
    expect(res.isError).toBeFalsy();
  });
});
