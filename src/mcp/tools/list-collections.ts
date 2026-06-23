import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'list_collections',
  description: 'List all collections and requests.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    const cols = await context.collectionManager.listCollections();
    return { content: [{ type: 'text', text: JSON.stringify(cols) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
