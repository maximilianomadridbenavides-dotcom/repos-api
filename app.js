import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataPath = fileURLToPath(new URL('./data/repositorios.json', import.meta.url));
const defaultRepositories = JSON.parse(readFileSync(dataPath, 'utf8'));

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

export function createApiServer({ repositories = defaultRepositories } = {}) {
  return createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (request.method === 'GET' && (url.pathname === '/health' || url.pathname === '/healthz')) {
      return sendJson(response, 200, { status: 'ok' });
    }

    if (request.method === 'GET' && url.pathname === '/api/repositorios') {
      return sendJson(response, 200, {
        ok: true,
        total: repositories.length,
        data: repositories,
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return sendJson(response, 404, { ok: false, error: 'Endpoint no encontrado' });
    }

    return sendJson(response, 404, { ok: false, error: 'Ruta no encontrada' });
  });
}
