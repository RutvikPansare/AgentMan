import { useEffect, useState } from 'react';
import { fetchCollections, fetchEnvironments } from '../api';
import { CapturePanel } from './CapturePanel';

export function Sidebar({ onRunCollection }: { onRunCollection: (name: string) => void }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any>(null);

  useEffect(() => {
    fetchCollections().then(setCollections).catch(console.error);
    fetchEnvironments().then(setEnvironments).catch(console.error);
  }, []);

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Environments</h2>
        <ul className="space-y-1">
          {environments?.environments?.map((env: any) => (
            <li key={env.name} className={`text-sm p-1 rounded ${environments?.active === env.name ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
              {env.name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Collections</h2>
        <div className="space-y-2">
          {collections.map(col => (
            <div key={col.name}>
              <div className="flex items-center justify-between group">
                <div className="text-sm font-semibold text-gray-300 pb-1">{col.name}</div>
                <button 
                  className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 transition-opacity px-2"
                  title="Run Collection"
                  onClick={() => onRunCollection(col.name)}
                >
                  ▶
                </button>
              </div>
              <ul className="pl-4 border-l border-gray-800 space-y-1">
                {col.requests.map((req: any) => (
                  <li key={req.name} className="text-sm text-gray-400 hover:text-white cursor-pointer py-1">
                    <span className="text-xs font-mono text-green-500 mr-2">{req.method}</span>
                    {req.name}
                  </li>
                ))}
                {col.requests.length === 0 && <li className="text-xs text-gray-600 italic">Empty</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <CapturePanel onSelectCaptured={(req) => console.log('Captured selected', req)} />
    </div>
  );
}
