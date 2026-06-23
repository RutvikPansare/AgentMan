import { useState } from 'react';

interface RequestEditorProps {
  request: any;
  onFire: (req: any) => void;
  onSave: (req: any) => void;
}

export function RequestEditor({ request, onFire, onSave }: RequestEditorProps) {
  const [activeTab, setActiveTab] = useState('params');
  const [url, setUrl] = useState(request?.url || '');
  const [method, setMethod] = useState(request?.method || 'GET');

  if (!request) {
    return <div className="h-full flex items-center justify-center text-gray-500">Select a request to edit</div>;
  }

  const tabs = ['params', 'headers', 'body', 'auth'];

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-md overflow-hidden">
      <div className="flex p-2 gap-2 border-b border-gray-800 bg-gray-950">
        <select 
          className="bg-gray-800 text-gray-200 border border-gray-700 rounded px-2 py-1 text-sm font-semibold focus:outline-none"
          value={method}
          onChange={e => setMethod(e.target.value)}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
        <input 
          type="text" 
          className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/users"
        />
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded text-sm font-semibold transition-colors"
          onClick={() => onFire({ ...request, method, url })}
        >
          Send
        </button>
        <button 
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm font-semibold transition-colors"
          onClick={() => onSave({ ...request, method, url })}
        >
          Save
        </button>
      </div>

      <div className="flex border-b border-gray-800 px-2 bg-gray-950">
        {tabs.map(tab => (
          <button 
            key={tab}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <div className="text-gray-500 text-sm">
          {activeTab} editor coming soon...
        </div>
      </div>
    </div>
  );
}
