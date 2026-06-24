import { describe, it, expect, vi } from 'vitest';
import { definition, handler } from './set-variable.js';
import { EnvironmentNotFoundError } from '../../engine/environment-manager.js';

describe('set_variable', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('set_variable');
    expect(definition.inputSchema.required).toContain('environment');
    expect(definition.inputSchema.required).toContain('key');
    expect(definition.inputSchema.required).toContain('value');
  });

  it('should set variable in existing env', async () => {
    const mockContext: any = {
      environmentManager: {
        updateVariable: vi.fn().mockResolvedValue(undefined),
        createEnvironment: vi.fn()
      }
    };
    const res = await handler({ environment: 'dev', key: 'foo', value: 'bar' }, mockContext);
    expect(res.content[0].text).toContain('foo');
    expect(mockContext.environmentManager.updateVariable).toHaveBeenCalledWith('dev', 'foo', 'bar');
    expect(mockContext.environmentManager.createEnvironment).not.toHaveBeenCalled();
  });

  it('should create env if not found', async () => {
    const mockContext: any = {
      environmentManager: {
        updateVariable: vi.fn().mockRejectedValue(new EnvironmentNotFoundError('Not found')),
        createEnvironment: vi.fn().mockResolvedValue(undefined)
      }
    };
    const res = await handler({ environment: 'newenv', key: 'foo', value: 'bar' }, mockContext);
    expect(res.content[0].text).toContain('foo');
    expect(mockContext.environmentManager.createEnvironment).toHaveBeenCalledWith('newenv', { foo: 'bar' });
  });
});
