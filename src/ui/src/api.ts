export async function fetchCollections() {
  const res = await fetch('/api/collections');
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function fetchEnvironments() {
  const res = await fetch('/api/environments');
  if (!res.ok) throw new Error('Failed to fetch environments');
  return res.json();
}

export async function setActiveEnvironment(name: string) {
  const res = await fetch('/api/environments/active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to set active environment');
  return res.json();
}
