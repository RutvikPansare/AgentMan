import { describe, it, expect } from 'vitest';
import { definition, handler } from './run-collection.js';

describe('run-collection', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('run_collection');
  });

  it('should run sequentially and stop on error', async () => {
    const mockContext: any = {
      collectionManager: {
        getCollection: async () => ({
          requests: [
            { name: 'R1', authProfileId: null },
            { name: 'R2', authProfileId: null },
            { name: 'R3', authProfileId: null }
          ]
        })
      },
      environmentManager: { getActiveEnvironment: async () => null },
      authManager: { getProfile: async () => null },
      executeRequest: async (req: any) => {
        if (req.name === 'R2') return { status: 500 };
        return { status: 200 };
      },
      lastResponseCache: new Map()
    };
    const res = await handler({ collectionName: 'C1' }, mockContext);
    const summary = JSON.parse(res.content[0].text);
    
    expect(summary).toHaveLength(2); // Should stop at R2
    expect(summary[0].success).toBe(true);
    expect(summary[1].success).toBe(false);
  });
});
