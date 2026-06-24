import { useEffect, useState, useRef, useMemo } from 'react';
import { fetchCollections } from '../api';
import { methodColorClass } from '../lib/colors';

interface SpotlightSearchProps {
  onSelectRequest: (req: any, collectionName: string) => void;
  onClose: () => void;
}

interface ResultItem {
  type: 'collection' | 'request';
  label: string;
  sublabel: string;
  method?: string;
  collectionName: string;
  request?: any;
}

const methodColor = methodColorClass;

export function SpotlightSearch({ onSelectRequest, onClose }: SpotlightSearchProps) {
  const [query, setQuery] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCollections().then(setCollections).catch(console.error);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: ResultItem[] = [];
    for (const col of collections) {
      const colMatch = !q || col.name.toLowerCase().includes(q);
      if (colMatch) {
        items.push({
          type: 'collection',
          label: col.name,
          sublabel: `${col.requests?.length || 0} requests`,
          collectionName: col.name
        });
      }
      for (const req of col.requests || []) {
        const matches =
          !q ||
          req.name?.toLowerCase().includes(q) ||
          req.url?.toLowerCase().includes(q) ||
          col.name.toLowerCase().includes(q);
        if (matches) {
          items.push({
            type: 'request',
            label: req.name,
            sublabel: req.url,
            method: req.method,
            collectionName: col.name,
            request: req
          });
        }
      }
    }
    return items.slice(0, 50);
  }, [query, collections]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const choose = (item: ResultItem) => {
    if (item.type === 'request' && item.request) {
      onSelectRequest(item.request, item.collectionName);
      onClose();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) choose(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none border-b border-gray-800"
          placeholder="Search collections, requests, URLs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && (
            <p className="text-xs text-gray-600 italic px-4 py-3">No results</p>
          )}
          {results.map((item, i) => (
            <div
              key={`${item.type}-${item.collectionName}-${item.label}-${i}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => choose(item)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                i === activeIndex ? 'bg-gray-800' : 'hover:bg-gray-800/50'
              }`}
            >
              {item.method ? (
                <span className={`text-[10px] font-bold w-12 shrink-0 ${methodColor(item.method)}`}>
                  {item.method}
                </span>
              ) : (
                <span className="text-[10px] text-gray-500 w-12 shrink-0">COL</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">{item.label}</div>
                <div className="text-[10px] text-gray-600 truncate">{item.sublabel}</div>
              </div>
              <span className="text-[10px] text-gray-600 shrink-0">{item.collectionName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
