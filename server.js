import { createApiServer } from './app.js';

const port = Number(process.env.PORT || 3000);
const server = createApiServer();

server.listen(port, '0.0.0.0', () => {
  process.stdout.write(`API de repositorios escuchando en el puerto ${port}\n`);
});
