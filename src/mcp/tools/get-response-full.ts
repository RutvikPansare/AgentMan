import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'get_response_full',
  description: 'Retrieve the complete untruncated last response for a named request from the ResponseStore. Agents call this when they need the full payload after seeing the truncated version.',
  inputSchema: {
    type: 'object',
    properties: {
      requestName: { type: 'string' }
    },
    required: ['requestName']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  const res = context.responseStore.get(args.requestName);
  if (!res) {
    return { content: [{ type: 'text', text: `No cached response found for ${args.requestName}` }], isError: true };
  }
  
  const untruncatedRes = { ...res };
  if (untruncatedRes.fullBody !== undefined) {
    untruncatedRes.body = untruncatedRes.fullBody;
    delete untruncatedRes.fullBody;
  }
  
  return { content: [{ type: 'text', text: JSON.stringify(untruncatedRes) }] };
}
