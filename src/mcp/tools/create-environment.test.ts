import { describe, it, expect, vi } from 'vitest';
import { definition, handler } from './create-environment.js';

describe('create_environment', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('create_environment');
    expect(definition.inputSchema.required).toContain('name');
  });

  it('should create environment', async () => {
    const mockContext: any = {
      environmentManager: {
        createEnvironment: vi.fn().mockResolvedValue({ name: 'testenv', variables: {} })
      }
    };
    const res = await handler({ name: 'testenv' }, mockContext);
    expect(res.content[0].text).toContain('testenv');
    expect(mockContext.environmentManager.createEnvironment).toHaveBeenCalledWith('testenv', {});
  });
});
