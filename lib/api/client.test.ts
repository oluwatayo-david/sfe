import { api, ApiError } from './client'

function mockFetch(status: number, body: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(body, { status, headers: { 'Content-Type': 'application/json' } }))
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('resolves with the body on success', async () => {
    mockFetch(200, JSON.stringify({ data: { id: 'txn_1' } }))
    await expect(api.get('/transactions/txn_1')).resolves.toEqual({ data: { id: 'txn_1' } })
  })

  it('rejects with ApiError carrying the server code and message', async () => {
    mockFetch(404, JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Transaction txn_x not found' } }))
    const error = await api.get('/transactions/txn_x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'Transaction txn_x not found' })
  })

  it('rejects with ApiError when an error response is not JSON', async () => {
    mockFetch(502, '<html>Bad gateway</html>')
    await expect(api.get('/me')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' })
  })
})
