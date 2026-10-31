/**
 * Minimal zero-dependency static file server.
 * Serves ./public plus ./config.json (kept at the project root so it's easy to find).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = resolve(ROOT, 'public');
const CONFIG_FILE = resolve(ROOT, 'config.json');
const PORT = Number(process.env.PORT) || 8080;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

/** Map a URL path to a file on disk, or null if it falls outside the public dir. */
function resolveFile(urlPath) {
  if (urlPath === '/config.json') return CONFIG_FILE;
  const relative = urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath;
  const file = resolve(join(PUBLIC_DIR, relative));
  return file.startsWith(PUBLIC_DIR + sep) ? file : null;
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  const file = resolveFile(pathname);
  if (!file) {
    res.writeHead(404).end('Not found');
    return;
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const status = error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500;
    if (status === 500) console.error(error);
    res.writeHead(status).end(status === 404 ? 'Not found' : 'Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Countdown running at http://localhost:${PORT}`);
});
