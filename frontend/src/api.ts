import { HealthResponse, ModelStatusResponse, InferenceRequest, InferenceResponse } from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new ApiError(`Health check failed (${res.status})`, res.status);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchModelStatus(): Promise<ModelStatusResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}/model/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new ApiError(`Model status check failed (${res.status})`, res.status);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function submitInference(
  payload: InferenceRequest,
  externalSignal?: AbortSignal,
): Promise<InferenceResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s max for CPU inference

  // Bridge external signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(`${API_BASE}/infer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errMsg = `Server returned HTTP ${res.status}`;
      if (data && typeof data === 'object') {
        if ('message' in data && typeof data.message === 'string') {
          errMsg = data.message;
        } else if ('error' in data && typeof data.error === 'string') {
          errMsg = data.error;
        } else if ('detail' in data) {
          if (typeof data.detail === 'string') {
            errMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errMsg = data.detail.map((d: { msg?: string }) => d.msg || 'Invalid field').join('; ');
          }
        }
      }
      throw new ApiError(errMsg, res.status, data);
    }

    return data as InferenceResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}
