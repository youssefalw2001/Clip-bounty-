// Minimal static file host used only for local visual verification of the
// production build. Not part of the app or its deploy path.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = new URL('../dist/', import.meta.url).pathname
const port = Number(process.argv[2] ?? 5180)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://x')
    let rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
    if (rel === '/' || rel === '\\') rel = '/index.html'
    const file = join(root, rel)
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    // SPA fallback
    try {
      const body = await readFile(join(root, 'index.html'))
      res.writeHead(200, { 'content-type': types['.html'] })
      res.end(body)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  }
}).listen(port, () => console.log(`static host on ${port}`))
