import { useState, useEffect, useRef } from 'react';

// Persists a piece of state to localStorage, debounced so rapid updates
// (e.g. every keystroke flowing through onChange) don't thrash storage writes.
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw) as T;
    } catch {
      // ignore parse errors / unavailable storage
    }
    return initial;
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore quota / unavailable storage
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, value]);

  return [value, setValue];
}
