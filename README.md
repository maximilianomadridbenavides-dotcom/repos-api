# repos-api

API HTTP de Node.js que sirve el catálogo de repositorios de ejemplo. El endpoint de datos es `GET /api/repositorios`; las comprobaciones de salud están en `/health` y `/healthz`.

## Requisitos

- Node.js 22 o posterior y npm para pruebas.
- Docker para construir la imagen.
- Helm y Minikube para desplegar en Kubernetes.

## Pruebas y cobertura

```bash
npm ci
npm test
```

Genera cobertura de consola y `coverage/lcov.info`.

## Ejecución local

```bash
npm start
```

La API escucha en `http://localhost:3000` de forma predeterminada. Usa `PORT` para cambiarlo.

## Docker y Helm

```bash
docker build -t repos-api:1.0 .
helm lint ./helm
minikube image build -t repos-api:1.0 .
helm upgrade --install repos-api ./helm -n reto --create-namespace
```

El Service interno debe llamarse `repos-api` y expone el puerto 3000 para que el frontend lo encuentre.

## CI y SonarQube Cloud

GitHub Actions ejecuta pruebas, cobertura, análisis y construcción Docker. Configura el secreto `SONAR_TOKEN` en el repositorio. La clave de proyecto se define en `sonar-project.properties`.
