import { Folder, Globe, History, Network, Radio, Settings } from 'lucide-react';

export type NavPanel = 'collections' | 'environments' | 'history' | 'graphql' | 'capture' | 'settings';

interface NavRailProps {
  active: NavPanel;
  onSelect: (panel: NavPanel) => void;
}

interface NavItem {
  id: NavPanel;
  label: string;
  icon: React.ReactNode;
}

// Icons: 18px, Lucide React, matches Hoppscotch nav rail sizing.
// Active state: colored background chip + left accent bar.
const NAV_ITEMS: NavItem[] = [
  { id: 'collections', label: 'Collections', icon: <Folder size={18} /> },
  { id: 'environments', label: 'Environments', icon: <Globe size={18} /> },
  { id: 'history', label: 'History', icon: <History size={18} /> },
  { id: 'graphql', label: 'GraphQL', icon: <Network size={18} /> },
  { id: 'capture', label: 'Capture', icon: <Radio size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function NavRail({ active, onSelect }: NavRailProps) {
  return (
    <nav className="w-12 shrink-0 border-r border-gray-800 bg-gray-950 flex flex-col items-center py-2 gap-1">
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative w-12 h-10 flex items-center justify-center transition-colors"
          >
            {/* Active accent bar on the left edge, Hoppscotch `after:left-0 after:w-0.5` */}
            {isActive && (
              <span className="absolute left-0 inset-y-2 w-0.5 bg-blue-500 rounded-full" aria-hidden="true" />
            )}
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {item.icon}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
