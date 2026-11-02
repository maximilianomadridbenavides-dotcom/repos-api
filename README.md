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

## Controles de calidad obligatorios

Ejecuta `npm run test:coverage`. Se mide todo el JavaScript de la raíz con `c8 --all`, incluso los archivos que ninguna prueba importe. La pipeline exige como mínimo 90 % de líneas, sentencias y funciones, y 80 % de ramas en el conjunto del componente. No se excluye el servidor local ni el arranque de la API para mejorar artificialmente el porcentaje.

Las pruebas de frontend incluyen la página con DOM, filtros, actualización, respuestas inválidas, errores HTTP y de red, y el proxy del servidor local. Las pruebas de backend incluyen los endpoints y el arranque real en un puerto configurado. Los procesos de prueba se detienen de forma controlada para guardar cobertura también en Windows.

SonarCloud importa LCOV. `sonar.qualitygate.wait=true` obliga a esperar su Quality Gate y falla el análisis si el resultado es rechazado. El mínimo global de cobertura se impone con c8 antes del análisis; este control es independiente de las condiciones del Quality Gate de SonarCloud.
