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


## Sprint 6: despliegue reproducible en Windows

Con Docker Desktop funcionando en modo Linux, instala Minikube y Helm desde sus fuentes oficiales. Inicia una vez el clúster con `minikube start --driver=docker --cpus=2 --memory=3072 --profile=devops-reto`.

Despliega primero el backend y después el frontend. Desde la raíz de cada repositorio ejecuta `./deploy-minikube.ps1`. El script requiere un clúster ya iniciado, construye la imagen con Docker Desktop y la carga dentro del perfil Minikube, comprueba Helm, instala con espera y reversión automática ante errores, y comprueba el despliegue. Se puede cambiar la etiqueta con `-ImageTag 1.1` para una nueva versión.

El script del frontend comprueba que Nginx consulte la API a través del Service interno `repos-api:3000` y reciba los cinco repositorios. Los charts usan imágenes locales con `imagePullPolicy: Never`, límites de CPU y memoria, y comprobaciones de disponibilidad y salud.

Para ver la aplicación deja activo `kubectl --context devops-reto -n reto port-forward svc/repos-front 8080:80` y abre `http://localhost:8080`. Para obtener evidencias usa `helm list --kube-context devops-reto -n reto` y `kubectl --context devops-reto -n reto get pods,svc`.

Si aparece `ErrImageNeverPull`, comprueba el perfil y la etiqueta usada al construir. Si Nginx no encuentra la API, comprueba que el backend esté listo en el mismo namespace. Para investigar usa `kubectl --context devops-reto -n reto get events --sort-by=.lastTimestamp` y los logs del deployment correspondiente.



En este equipo, el constructor interno de Minikube encontró errores de certificados al acceder a Docker Hub. Se usa Docker Desktop para construir y minikube image load --daemon para cargar la imagen local, conservando la verificación TLS. El script comprueba que la imagen exista en el clúster antes de instalar con Helm.

## Entrega y defensa

Consulta [la guía de entrega](docs/ENTREGA.md) y [la guía de defensa](docs/DEFENSA.md).
