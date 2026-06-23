import { useState } from 'react';

interface CollectionRunnerPanelProps {
  collectionName: string;
  onClose: () => void;
}

export function CollectionRunnerPanel({ collectionName, onClose }: CollectionRunnerPanelProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stopOnFailure, setStopOnFailure] = useState(false);

  const runCollection = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/run/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName, stopOnFailure })
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-950 z-50 flex flex-col p-6 animate-slide-up overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 shrink-0">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>🏃</span> Run: <span className="text-blue-400">{collectionName}</span>
        </h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400 flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
              checked={stopOnFailure}
              onChange={e => setStopOnFailure(e.target.checked)}
            />
            Stop on failure
          </label>
          <button 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors disabled:opacity-50"
            onClick={runCollection}
            disabled={running}
          >
            {running ? 'Running...' : 'Run Collection'}
          </button>
          <button 
            className="text-gray-500 hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      {result && (
        <div className="mb-6 p-4 rounded bg-gray-900 border border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex gap-6">
            <div>
              <div className="text-xs text-gray-500 uppercase">Total</div>
              <div className="text-xl font-bold">{result.total}</div>
            </div>
            <div>
              <div className="text-xs text-green-500 uppercase">Passed</div>
              <div className="text-xl font-bold text-green-500">{result.passed}</div>
            </div>
            <div>
              <div className="text-xs text-red-500 uppercase">Failed</div>
              <div className="text-xl font-bold text-red-500">{result.failed}</div>
            </div>
          </div>
          <button onClick={runCollection} className="text-sm text-blue-400 hover:underline">Re-run</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-12">
        {result?.results?.map((req: any, i: number) => (
          <div key={i} className={\`p-4 rounded border \${req.passed ? 'bg-gray-900 border-gray-800' : 'bg-red-950/20 border-red-900/50'}\`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{req.passed ? '✅' : '❌'}</span>
                <span className="font-semibold text-gray-200">{req.requestName}</span>
              </div>
              <div className="text-sm text-gray-500">{req.duration} ms</div>
            </div>
            
            {req.error && (
              <div className="text-sm text-red-400 ml-8 mb-2">Error: {req.error}</div>
            )}

            {req.assertions?.length > 0 && (
              <div className="ml-8 space-y-1">
                {req.assertions.map((ass: any, j: number) => (
                  <div key={j} className={\`text-xs \${ass.passed ? 'text-green-500/70' : 'text-red-400 font-semibold'}\`}>
                    {ass.passed ? '✓' : '✗'} {ass.assertion.field} {ass.assertion.operator} {ass.assertion.value}
                    {!ass.passed && \` (got: \${ass.actual})\`}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {!result && !running && (
          <div className="text-center text-gray-600 mt-12">
            Click "Run Collection" to execute all requests.
          </div>
        )}

        {running && !result && (
          <div className="text-center text-blue-400 mt-12 animate-pulse">
            Executing requests...
          </div>
        )}
      </div>
    </div>
  );
}
