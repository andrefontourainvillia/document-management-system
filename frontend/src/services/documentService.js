export const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID || 'demo-user';

async function parseResponse(response) {
  if (response.ok) {
    return response.json();
  }

  const body = await response.json().catch(() => null);
  throw new Error(body?.error?.message || 'Não foi possível concluir a operação.');
}

export async function uploadDocument(file, userId = DEFAULT_USER_ID) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });

  return parseResponse(response);
}

export async function listDocuments(userId = DEFAULT_USER_ID) {
  const response = await fetch('/api/documents', {
    headers: { 'X-User-Id': userId },
  });

  const data = await parseResponse(response);
  return data.documents || [];
}

export function getDownloadUrl(documentId) {
  return `/api/documents/${encodeURIComponent(documentId)}/download`;
}

export function getDownloadHeaders(userId = DEFAULT_USER_ID) {
  return { 'X-User-Id': userId };
}