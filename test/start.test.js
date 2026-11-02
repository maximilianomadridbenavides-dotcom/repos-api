import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';

test('el comando de arranque sirve la API en el puerto configurado', { timeout: 15000 }, async (t) => {
  const reservation = http.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, ['--import', './test/support/shutdown.js', 'server.js'], {
    cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  t.after(async () => { const exited = once(child, 'exit'); child.send('shutdown'); await exited; });
  await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => { throw new Error('La API terminó antes de iniciar'); })]);
  const response = await fetch(`http://127.0.0.1:${port}/healthz`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

