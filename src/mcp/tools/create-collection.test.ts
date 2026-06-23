import { describe, it, expect } from 'vitest';
import { definition, handler } from './create-collection.js';

describe('create-collection', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('create_collection');
  });

  it('should return successful result', async () => {
    const mockContext: any = {
      collectionManager: {
        createCollection: async (name: string) => ({ name, requests: [] })
      }
    };
    const res = await handler({ name: 'test' }, mockContext);
    expect(res.content[0].text).toContain('test');
    expect(res.isError).toBeFalsy();
  });
});
