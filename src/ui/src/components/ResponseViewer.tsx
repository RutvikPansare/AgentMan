import { useState } from 'react';

interface ResponseViewerProps {
  response: any;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState('body');

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 bg-gray-900 border border-gray-800 rounded-md">
        No response yet
      </div>
    );
  }

  const { status, time, data, headers } = response;
  const isError = status >= 400;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-900 border border-gray-800 rounded-md overflow-hidden min-h-[300px]">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-950 border-b border-gray-800">
        <div className="flex gap-4 text-sm font-mono">
          <span className={isError ? 'text-red-500' : 'text-green-500'}>
            {status} {isError ? 'Error' : 'OK'}
          </span>
          <span className="text-gray-400">{time || 0} ms</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded transition-colors"
        >
          Copy
        </button>
      </div>

      <div className="flex border-b border-gray-800 px-2 bg-gray-950">
        {['body', 'headers'].map(tab => (
          <button 
            key={tab}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm">
        {activeTab === 'body' && (
          <pre className="text-gray-300 whitespace-pre-wrap">
            {typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
          </pre>
        )}
        {activeTab === 'headers' && (
          <pre className="text-gray-400">
            {JSON.stringify(headers, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
