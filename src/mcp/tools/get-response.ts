import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'get_response',
  description: 'Retrieve last response for a request.',
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
  return { content: [{ type: 'text', text: JSON.stringify(res) }] };
}
