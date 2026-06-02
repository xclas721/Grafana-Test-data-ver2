import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** 載入專案根目錄 `.env.server`（不覆寫已存在的 process.env） */
export function loadEnvServer(): void {
  const path = resolve(process.cwd(), '.env.server')
  if (!existsSync(path)) return

  const text = readFileSync(path, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = val
    }
  }
}
