#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// 确保 dist/index.js 有 shebang
const indexPath = join(process.cwd(), 'dist', 'index.js')
let content = readFileSync(indexPath, 'utf-8')

if (!content.startsWith('#!/usr/bin/env node')) {
  content = '#!/usr/bin/env node\n' + content
  writeFileSync(indexPath, content)
  console.log('✅ Added shebang to dist/index.js')
}
