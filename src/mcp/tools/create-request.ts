import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'create_request',
  description: 'Create a new request in a collection.',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: { type: 'string' },
      request: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          method: { type: 'string' },
          url: { type: 'string' },
          headers: { type: 'object' },
          body: { type: 'string' },
          params: { type: 'object' },
          authProfileId: { type: 'string' },
          environmentId: { type: 'string' }
        },
        required: ['id', 'name', 'method', 'url']
      }
    },
    required: ['collectionName', 'request']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    await context.collectionManager.addRequest(args.collectionName, args.request);
    return { content: [{ type: 'text', text: JSON.stringify({ success: true }) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
