#!/usr/bin/env node
/**
 * 從本地後端 OpenAPI 規格產生 TypeScript 型別。
 * 請先啟動後端，再執行本腳本。產出 schema.d.ts 一併 commit，部署後使用 repo 內檔案即可。
 */
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const out = join(root, 'src/api/generated/schema.d.ts');
const url = 'http://localhost:8080/v3/api-docs';

console.log('OpenAPI source:', url);
execSync(`npx openapi-typescript "${url}" -o "${out}"`, { stdio: 'inherit', cwd: root });
