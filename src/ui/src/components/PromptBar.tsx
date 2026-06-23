import { useState, useEffect } from 'react';
import { fetchConfig } from '../api-config';

interface PromptBarProps {
  activeRequest?: any;
}

export function PromptBar({ activeRequest }: PromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    fetchConfig().then(cfg => {
      setHasApiKey(!!cfg.llmApiKey);
    }).catch(() => setHasApiKey(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      if (!hasApiKey) {
        throw new Error('No API key configured. Please set it in Settings.');
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt, activeRequest })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 max-h-32 overflow-y-auto space-y-2 text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-gray-800 text-blue-300 ml-8' : 'bg-gray-950 text-gray-300 mr-8'}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          {!hasApiKey && (
            <div className="text-yellow-500 cursor-help" title="No API key configured. Please set it in Settings.">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
            </div>
          )}
          <div className="relative flex-1">
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
          </div>
        </form>
      </div>
    </div>
  );
}
