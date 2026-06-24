import { describe, it, expect, vi } from 'vitest';
import { definition, handler } from './get-variables.js';

describe('get_variables', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('get_variables');
  });

  it('should get variables from named env', async () => {
    const mockContext: any = {
      environmentManager: {
        getEnvironment: vi.fn().mockResolvedValue({ name: 'dev', variables: { key1: 'val1', key2: 'val2' } }),
        getActiveEnvironment: vi.fn()
      }
    };
    const res = await handler({ environment: 'dev' }, mockContext);
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed).toEqual([{ key: 'key1', value: 'val1' }, { key: 'key2', value: 'val2' }]);
    expect(mockContext.environmentManager.getEnvironment).toHaveBeenCalledWith('dev');
  });

  it('should get variables from active env if none specified', async () => {
    const mockContext: any = {
      environmentManager: {
        getActiveEnvironment: vi.fn().mockResolvedValue({ name: 'prod', variables: { key3: 'val3' } }),
        getEnvironment: vi.fn()
      }
    };
    const res = await handler({}, mockContext);
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed).toEqual([{ key: 'key3', value: 'val3' }]);
    expect(mockContext.environmentManager.getActiveEnvironment).toHaveBeenCalled();
  });
});
