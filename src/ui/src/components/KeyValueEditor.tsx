

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

export function KeyValueEditor({ pairs, onChange }: KeyValueEditorProps) {
  // Ensure there's always an empty row at the bottom
  const items = [...pairs];
  if (items.length === 0 || (items[items.length - 1].key !== '' || items[items.length - 1].value !== '')) {
    items.push({ key: '', value: '', enabled: true });
  }

  const handleChange = (index: number, field: keyof KeyValuePair, val: any) => {
    const newPairs = [...items];
    newPairs[index] = { ...newPairs[index], [field]: val };
    
    // Auto-enable if user types in a completely empty row
    if (field !== 'enabled' && !items[index].key && !items[index].value && val) {
      newPairs[index].enabled = true;
    }

    // Filter out the last row if it's empty, we add it back automatically during render
    const filtered = newPairs.filter((p, i) => i !== newPairs.length - 1 || p.key || p.value);
    onChange(filtered);
  };

  const handleRemove = (index: number) => {
    const newPairs = items.filter((_, i) => i !== index);
    onChange(newPairs);
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-4xl">
      {items.map((pair, i) => {
        const isLastEmpty = i === items.length - 1 && !pair.key && !pair.value;
        return (
          <div key={i} className="flex items-center gap-2 group">
            <button 
              className="text-gray-500 hover:text-gray-300 w-6 flex justify-center"
              onClick={() => !isLastEmpty && handleChange(i, 'enabled', !pair.enabled)}
              disabled={isLastEmpty}
            >
              {!isLastEmpty ? (
                pair.enabled ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="text-green-500" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  </svg>
                )
              ) : (
                <div className="w-3.5 h-3.5"></div>
              )}
            </button>
            <input 
              className={`flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 ${!pair.enabled && !isLastEmpty ? 'opacity-50' : ''}`}
              placeholder="Key"
              value={pair.key}
              onChange={e => handleChange(i, 'key', e.target.value)}
            />
            <input 
              className={`flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 ${!pair.enabled && !isLastEmpty ? 'opacity-50' : ''}`}
              placeholder="Value"
              value={pair.value}
              onChange={e => handleChange(i, 'value', e.target.value)}
            />
            <button 
              onClick={() => handleRemove(i)} 
              className={`text-gray-600 hover:text-red-400 w-6 flex justify-center ${isLastEmpty ? 'invisible' : 'invisible group-hover:visible'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
