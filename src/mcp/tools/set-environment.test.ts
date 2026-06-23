import { describe, it, expect } from 'vitest';
import { definition, handler } from './set-environment.js';

describe('set-environment', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('set_environment');
  });

  it('should set active env', async () => {
    const mockContext: any = {
      environmentManager: {
        setActiveEnvironment: async () => {}
      }
    };
    const res = await handler({ environmentName: 'dev' }, mockContext);
    expect(res.content[0].text).toContain('dev');
  });
});
