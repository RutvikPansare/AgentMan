import { useEffect, useState } from 'react';
import { fetchEnvironments, setActiveEnvironment } from '../api';

export function EnvironmentSwitcher() {
  const [environments, setEnvironments] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    fetchEnvironments().then(data => {
      setEnvironments(data.environments || []);
      setActive(data.active || null);
    }).catch(console.error);
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActive = e.target.value;
    try {
      await setActiveEnvironment(newActive);
      setActive(newActive);
    } catch (err) {
      console.error(err);
    }
  };

  if (environments.length === 0) return null;

  return (
    <select 
      className="bg-gray-800 text-gray-200 border border-gray-700 rounded px-2 py-1 text-sm font-semibold focus:outline-none"
      value={active || ''}
      onChange={handleChange}
    >
      <option value="" disabled>Select Environment</option>
      {environments.map(env => (
        <option key={env.name} value={env.name}>{env.name}</option>
      ))}
    </select>
  );
}
