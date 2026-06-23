import { useState, useEffect } from 'react';

export function CapturePanel({ onSelectCaptured }: { onSelectCaptured: (req: any) => void }) {
  const [active, setActive] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  const toggleProxy = async () => {
    if (active) {
      await fetch('/api/proxy/stop', { method: 'POST' });
      setActive(false);
    } else {
      await fetch('/api/proxy/start', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: 7474, collectionName: 'captured' })
      });
      setActive(true);
    }
  };

  const clearCaptured = async () => {
    await fetch('/api/proxy/captured', { method: 'DELETE' });
    setRequests([]);
  };

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/proxy/captured');
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="mt-4 border-t border-gray-800 pt-4">
      <div className="px-4 mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capture</h3>
        <button 
          onClick={toggleProxy}
          className={`w-8 h-4 rounded-full relative transition-colors \${active ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all \${active ? 'left-[18px]' : 'left-0.5'}`} />
        </button>
      </div>

      {active && (
        <div className="px-4 mb-2 text-xs text-blue-400">
          Listening on port 7474...<br/>
          <span className="text-gray-500">Set your app's HTTP proxy to localhost:7474</span>
        </div>
      )}

      {requests.length > 0 && (
        <div className="px-4 mb-2 flex justify-end">
          <button onClick={clearCaptured} className="text-xs text-gray-500 hover:text-white">Clear</button>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto">
        {requests.map((req, i) => (
          <div 
            key={i} 
            className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex flex-col gap-1 border-b border-gray-800/50"
            onClick={() => onSelectCaptured(req)}
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold \${
                req.method === 'GET' ? 'text-blue-400' : 
                req.method === 'POST' ? 'text-green-400' : 
                req.method === 'PUT' ? 'text-yellow-400' : 
                req.method === 'DELETE' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {req.method}
              </span>
              <span className="text-xs text-gray-300 truncate" title={req.url}>
                {new URL(req.url).pathname}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
