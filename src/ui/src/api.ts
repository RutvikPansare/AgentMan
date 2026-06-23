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

export const createEnvironment = async (name: string) => {
  const res = await fetch('/api/environments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, variables: {} })
  });
  if (!res.ok) throw new Error('Failed to create environment');
  return res.json();
};

export const updateEnvironment = async (name: string, variables: Record<string, string>) => {
  const res = await fetch(`/api/environments/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variables })
  });
  if (!res.ok) throw new Error('Failed to update environment');
  return res.json();
};

export async function setActiveEnvironment(name: string) {
  const res = await fetch('/api/environments/active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to set active environment');
  return res.json();
}

export async function createCollection(name: string) {
  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create collection');
  return res.json();
}

export async function addRequest(collectionName: string, request: any) {
  const res = await fetch(`/api/collections/${collectionName}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error('Failed to add request');
  return res.json();
}

export async function updateRequest(collectionName: string, oldRequestName: string, request: any) {
  const res = await fetch(`/api/collections/${collectionName}/requests/${oldRequestName}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error('Failed to update request');
  return res.json();
}

export async function deleteRequest(collectionName: string, requestName: string) {
  const res = await fetch(`/api/collections/${collectionName}/requests/${requestName}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete request');
  return res.json();
}

export async function fetchAuthProfiles() {
  const res = await fetch('/api/auth-profiles');
  if (!res.ok) throw new Error('Failed to fetch auth profiles');
  return res.json();
}

export async function createAuthProfile(profile: any) {
  const res = await fetch('/api/auth-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to create auth profile');
  return res.json();
}
