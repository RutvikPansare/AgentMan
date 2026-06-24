import { describe, it, expect, vi } from 'vitest';
import { definition, handler } from './delete-variable.js';

describe('delete_variable', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('delete_variable');
    expect(definition.inputSchema.required).toContain('environment');
    expect(definition.inputSchema.required).toContain('key');
  });

  it('should delete variable', async () => {
    const mockContext: any = {
      environmentManager: {
        getEnvironment: vi.fn().mockResolvedValue({ name: 'dev', variables: { keep: 'yes', remove: 'yes' } }),
        updateEnvironment: vi.fn().mockResolvedValue(undefined)
      }
    };
    const res = await handler({ environment: 'dev', key: 'remove' }, mockContext);
    expect(res.content[0].text).toContain('remove');
    expect(mockContext.environmentManager.updateEnvironment).toHaveBeenCalledWith('dev', { keep: 'yes' });
  });
});
