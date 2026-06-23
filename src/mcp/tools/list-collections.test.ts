import { describe, it, expect } from 'vitest';
import { definition, handler } from './list-collections.js';

describe('list-collections', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('list_collections');
  });

  it('should return successful result', async () => {
    const mockContext: any = {
      collectionManager: {
        listCollections: async () => [{ name: 'Col1', requests: [] }]
      }
    };
    const res = await handler({}, mockContext);
    expect(res.content[0].text).toContain('Col1');
  });
});
