import { useState } from 'react';
import { fetchConfig } from '../api-config';

export function PromptBar() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      const config = await fetchConfig();
      if (!config.llmApiKey) {
        throw new Error('No API key configured. Please set it in Settings.');
      }

      // Basic placeholder for the LLM loop that the UI will handle
      // In a real implementation, this would call fetch() to Anthropic/OpenAI,
      // parse tool_calls, and map them to /api/* endpoints.
      const simulatedResponse = "I have processed your request: " + currentPrompt;
      
      setMessages(prev => [...prev, { role: 'assistant', content: simulatedResponse }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: \${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 max-h-32 overflow-y-auto space-y-2 text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded \${msg.role === 'user' ? 'bg-gray-800 text-blue-300 ml-8' : 'bg-gray-950 text-gray-300 mr-8'}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            className="w-full bg-gray-950 text-gray-200 border border-gray-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 shadow-inner"
            placeholder="Describe what you want to do... (e.g. 'Create a collection for the Stripe API')"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white p-1.5 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm-2.846-3.7 4.338-2.761L2.576 1.87 3.79 6.37Z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
