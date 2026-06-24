import { describe, it, expect, vi } from 'vitest';
import { definition, handler } from './get-response-full.js';

describe('get_response_full', () => {
  it('should have correct definition', () => {
    expect(definition.name).toBe('get_response_full');
    expect(definition.inputSchema.required).toContain('requestName');
  });

  it('should return error if not found', async () => {
    const mockContext: any = {
      responseStore: { get: vi.fn().mockReturnValue(undefined) }
    };
    const res = await handler({ requestName: 'test' }, mockContext);
    expect(res.isError).toBe(true);
  });

  it('should return response with fullBody replacing body', async () => {
    const mockRes = {
      status: 200,
      body: 'truncated',
      fullBody: 'full untruncated body',
      headers: {}
    };
    const mockContext: any = {
      responseStore: { get: vi.fn().mockReturnValue(mockRes) }
    };
    const res = await handler({ requestName: 'test' }, mockContext);
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.body).toBe('full untruncated body');
    expect(parsed.fullBody).toBeUndefined();
  });

  it('should return response as is if fullBody is not present', async () => {
    const mockRes = {
      status: 200,
      body: 'small body',
      headers: {}
    };
    const mockContext: any = {
      responseStore: { get: vi.fn().mockReturnValue(mockRes) }
    };
    const res = await handler({ requestName: 'test' }, mockContext);
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.body).toBe('small body');
  });
});
