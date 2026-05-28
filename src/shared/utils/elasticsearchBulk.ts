/**
 * POST Elasticsearch _bulk（NDJSON）。若環境支援 CompressionStream 且壓縮後較小，會先嘗試 gzip；
 * 若 fetch 失敗（常見：代理不支援 gzip request body、Mixed Content），改送明文，語意不變。
 */
const GZIP_MIN_RAW_BYTES = 2048

export async function fetchElasticsearchBulk(
  baseUrl: string,
  authorization: string,
  ndjson: string
): Promise<Response> {
  const url = `${baseUrl.replace(/\/$/, '')}/_bulk`
  const baseHeaders: Record<string, string> = {
    Authorization: authorization,
    'Content-Type': 'application/x-ndjson'
  }

  async function postPlain(): Promise<Response> {
    return fetch(url, { method: 'POST', headers: { ...baseHeaders }, body: ndjson })
  }

  let gzipBody: ArrayBuffer | null = null
  if (typeof CompressionStream !== 'undefined') {
    const raw = new TextEncoder().encode(ndjson)
    if (raw.length >= GZIP_MIN_RAW_BYTES) {
      try {
        const compressed = await new Response(
          new Blob([ndjson]).stream().pipeThrough(new CompressionStream('gzip'))
        ).arrayBuffer()
        if (compressed.byteLength < raw.length) gzipBody = compressed
      } catch {
        gzipBody = null
      }
    }
  }

  if (gzipBody) {
    try {
      return await fetch(url, {
        method: 'POST',
        headers: { ...baseHeaders, 'Content-Encoding': 'gzip' },
        body: gzipBody
      })
    } catch {
      /* 網路層或瀏覽器拒絕 gzip body 時改送明文 */
    }
  }

  return postPlain()
}

export type ElasticsearchBulkResponse = {
  errors?: boolean
  items?: Array<{ index?: { error?: { reason?: string } } }>
}
