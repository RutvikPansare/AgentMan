import { useState, useEffect } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import type { KeyValuePair } from './KeyValueEditor';
import { updateEnvironment } from '../api';

interface EnvironmentEditorProps {
  environment: any;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function EnvironmentEditor({ environment, onClose, onSaveSuccess }: EnvironmentEditorProps) {
  const [variables, setVariables] = useState<KeyValuePair[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (environment && environment.variables) {
      const vars: KeyValuePair[] = [];
      Object.entries(environment.variables).forEach(([k, v]) => {
        vars.push({ key: k, value: String(v), enabled: true });
      });
      setVariables(vars);
    }
  }, [environment]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const varsObj: Record<string, string> = {};
      variables.forEach(v => {
        if (v.enabled && v.key) {
          varsObj[v.key] = v.value;
        }
      });
      await updateEnvironment(environment.name, varsObj);
      onSaveSuccess();
    } catch (e) {
      console.error(e);
      alert('Failed to save environment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl w-[800px] flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-200">
            Edit Environment: <span className="text-blue-400">{environment.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-gray-400 mb-4">
            Define variables for this environment. You can access them in your requests using <code>{`{{variable_name}}`}</code>.
          </p>
          <KeyValueEditor pairs={variables} onChange={setVariables} />
        </div>

        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950 rounded-b-lg flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Variables'}
          </button>
        </div>
      </div>
    </div>
  );
}
