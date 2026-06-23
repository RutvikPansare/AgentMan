
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RequestEditor } from './components/RequestEditor';
import { ResponseViewer } from './components/ResponseViewer';
import { EnvironmentSwitcher } from './components/EnvironmentSwitcher';
import { SettingsPanel } from './components/SettingsPanel';
import { PromptBar } from './components/PromptBar';
import { CollectionRunnerPanel } from './components/CollectionRunnerPanel';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>({ name: 'New Request', method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1' });
  const [response, setResponse] = useState<any>(null);
  const [runningCollection, setRunningCollection] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  const handleFire = async (req: any) => {
    setIsSending(true);
    try {
      const res = await fetch('/api/run/adhoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: req })
      });
      const data = await res.json();
      if (data.response) {
        setResponse({ ...data.response, assertions: data.assertions, previousResponse: data.previousResponse });
      } else {
        setResponse({ status: 500, latency: 0, body: data.error, headers: {} });
      }
    } catch (e: any) {
      setResponse({ status: 500, latency: 0, body: e.message, headers: {} });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="h-14 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 shrink-0">
        <h1 className="font-semibold tracking-wide">Reqly</h1>
        <div className="flex items-center gap-4">
          <EnvironmentSwitcher />
          <button 
            onClick={() => setShowSettings(true)} 
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto">
          <Sidebar 
            activeRequest={activeRequest}
            onSelectRequest={(req, col) => setActiveRequest({ ...req, _collection: col })}
            onRunCollection={setRunningCollection} 
          />
        </aside>
        <main className="flex-1 bg-gray-950 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="h-1/2 min-h-[300px]">
            <RequestEditor request={activeRequest} onFire={handleFire} onSave={(req) => setActiveRequest({ ...req, _collection: activeRequest._collection })} />
          </div>
          <ResponseViewer response={response} isSending={isSending} />
        </main>
      </div>
      <PromptBar activeRequest={activeRequest} />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {runningCollection && (
        <CollectionRunnerPanel collectionName={runningCollection} onClose={() => setRunningCollection(null)} />
      )}
    </div>
  );
}

export default App;
