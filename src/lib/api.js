import { API_URL } from '../config.js';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && data.trim()) ||
      res.statusText ||
      'Request failed';

    throw new ApiError(message, res.status, data);
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const { token, body, headers, ...rest } = options;
  const requestHeaders = new Headers(headers || {});

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let requestBody = body;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined && body !== null && typeof body === 'object') {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: requestBody,
  });

  return parseResponse(res);
}