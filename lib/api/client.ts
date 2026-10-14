import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

function isErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && 'error' in body
}

/** Resolves with the success body; rejects with ApiError on any non-2xx or unreadable response. */
async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  // A proxy or gateway can answer with HTML, so don't assume the body is JSON.
  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    if (isErrorBody(body)) throw new ApiError(res.status, body.error.code, body.error.message)
    throw new ApiError(res.status, 'UNKNOWN_ERROR', FALLBACK_MESSAGE)
  }
  if (body === null) throw new ApiError(res.status, 'INVALID_RESPONSE', FALLBACK_MESSAGE)

  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
