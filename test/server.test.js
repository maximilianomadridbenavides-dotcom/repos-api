import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApiServer } from '../app.js';

const repositories = [
  {
    id: 'REP-TEST',
    nombre: 'demo-api',
    descripcion: 'API de prueba',
    lenguaje: 'JavaScript',
    rama: 'main',
    estado: 'Activo',
    estrellas: 3,
    actualizado: '2026-01-01',
  },
];

const server = createApiServer({ repositories });
let baseUrl;

before(async () => {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe('API de repositorios', () => {
  it('responde al health check /health', async () => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('acepta también el health check /healthz', async () => {
    const response = await fetch(`${baseUrl}/healthz`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('devuelve el catálogo y su total', async () => {
    const response = await fetch(`${baseUrl}/api/repositorios`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.total, 1);
    assert.deepEqual(payload.data, repositories);
    assert.match(response.headers.get('content-type'), /application\/json/);
  });

  it('responde 404 para un endpoint de API desconocido', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { ok: false, error: 'Endpoint no encontrado' });
  });

  it('responde 404 para una ruta que no pertenece a la API', async () => {
    const response = await fetch(`${baseUrl}/ruta-no-existe`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { ok: false, error: 'Ruta no encontrada' });
  });
});
