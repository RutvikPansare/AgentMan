interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[400px] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <h2 className="font-semibold text-gray-200">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">More settings coming soon.</p>
        </div>
        <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-2 bg-gray-950">
          <button
            className="px-4 py-1.5 text-sm font-semibold text-gray-400 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
