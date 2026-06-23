import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'create_collection',
  description: 'Scaffold a new collection.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the collection' }
    },
    required: ['name']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    const col = await context.collectionManager.createCollection(args.name);
    return { content: [{ type: 'text', text: JSON.stringify(col) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
