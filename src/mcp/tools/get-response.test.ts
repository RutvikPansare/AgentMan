import { describe, it, expect } from 'vitest';
import { definition, handler } from './get-response.js';

describe('get-response', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('get_response');
  });

  it('should get cached response', async () => {
    const mockContext: any = {
      responseStore: { get: (name: string) => name === 'R1' ? { status: 200 } : undefined }
    };
    const res = await handler({ requestName: 'R1' }, mockContext);
    expect(res.content[0].text).toContain('200');
  });

  it('should return error if not found', async () => {
    const mockContext: any = { responseStore: { get: () => undefined } };
    const res = await handler({ requestName: 'R2' }, mockContext);
    expect(res.isError).toBe(true);
  });
});
