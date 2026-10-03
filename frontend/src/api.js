const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res;
}

export async function createPoll(data) {
  const res = await request('/api/polls', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getPoll(id) {
  const res = await request(`/api/polls/${id}`);
  return res.json();
}

export async function submitVote(id, votes) {
  const res = await request(`/api/polls/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ votes }),
  });
  return res.json();
}

export async function getResults(id) {
  const res = await request(`/api/polls/${id}/results`);
  return res.json();
}

export function getExportUrl(id) {
  return `${API_BASE}/api/polls/${id}/export`;
}
