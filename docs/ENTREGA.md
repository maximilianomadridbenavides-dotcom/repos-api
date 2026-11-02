# Entrega del reto DevOps — Maximiliano Madrid

## Accesos

- Frontend: https://github.com/maximilianomadridbenavides-dotcom/repos-front
- Backend: https://github.com/maximilianomadridbenavides-dotcom/repos-api
- CI frontend: https://github.com/maximilianomadridbenavides-dotcom/repos-front/actions/workflows/ci.yml
- CI backend: https://github.com/maximilianomadridbenavides-dotcom/repos-api/actions/workflows/ci.yml
- Sonar frontend: https://sonarcloud.io/summary/overall?id=maximilianomadridbenavides-dotcom_repos-front&branch=main
- Sonar backend: https://sonarcloud.io/summary/overall?id=maximilianomadridbenavides-dotcom_repos-api&branch=main
- Demostración local: http://localhost:8080 (requiere Minikube y port-forward activos).

## Correspondencia con el alcance

| Requisito | Implementación y evidencia |
| --- | --- |
| Dos repositorios independientes | Enlaces de frontend y backend anteriores |
| CI en push y pull request | .github/workflows/ci.yml en cada repositorio |
| Pruebas y cobertura | npm ci --ignore-scripts; npm run test:coverage; coverage/lcov.info |
| Análisis independiente y Quality Gate | sonar-project.properties; análisis en SonarCloud; espera del Gate habilitada |
| Dockerfiles y construcción en CI | Dockerfile en cada raíz; build-push-action con push:false |
| Charts de Helm | helm/ en cada repositorio; Deployment y Service |
| Despliegue local | deploy-minikube.ps1; perfil devops-reto; namespace reto |
| Frontend conectado a la API | Nginx -> repos-api:3000 -> catálogo de cinco repositorios |
| Investigación de un problema | docs/SPRINT6.md y docs/DEFENSA.md |

## Repetir desde una copia nueva

Requisitos: Git, Node.js >=22.12, Docker Desktop en Linux containers, Minikube, Helm y kubectl.

1. Clonar ambos repositorios en carpetas separadas.
2. En cada repositorio ejecutar npm ci --ignore-scripts y npm run test:coverage.
3. Iniciar Docker Desktop y ejecutar minikube start --driver=docker --cpus=2 --memory=3072 --profile=devops-reto.
4. Ejecutar ./deploy-minikube.ps1 en el backend y después en el frontend. La versión final usa imágenes 1.1.
5. Ejecutar kubectl --context devops-reto -n reto get pods,svc. Ambos pods deben estar 1/1 Running.
6. Ejecutar kubectl --context devops-reto -n reto port-forward svc/repos-front 8080:80 y mantener esa ventana activa.
7. Abrir http://localhost:8080; comprobar API conectada, cinco repositorios, búsqueda y filtro.

## Decisiones de calidad

- Cobertura de todo el JavaScript con c8 --all; mínimos globales: 90 % de líneas, sentencias y funciones, 80 % de ramas.
- PowerShell mantiene análisis estático; su ejecución se verifica en Minikube y no se mide con LCOV de JavaScript.
- Acciones de terceros fijadas a SHA; instalaciones sin scripts de dependencias.
- Token Sonar guardado en secretos de GitHub. No forma parte de la entrega; una copia en otra cuenta necesita configurar su propio secreto y proyectos.
- Nginx ejecuta como nginx, puerto interno 8080; el Service conserva puerto 80. La API ejecuta como node.
- Los pods no montan token de ServiceAccount; recursos de CPU, memoria y almacenamiento efímero definidos.
- c8 actualizado; versiones transitivas glob/minimatch corregidas mediante overrides explícitos y validadas con las pruebas. Mantener estos overrides bajo revisión al actualizar test-exclude.
- Proxy de desarrollo restringido al endpoint público del catálogo, sin reenviar cabeceras del cliente ni redirecciones del upstream.

## Límites de la entrega

El despliegue es local. GitHub Actions comprueba imágenes, no publica en un registro ni despliega en el Minikube del usuario. No se afirma alta disponibilidad, exposición pública, pruebas de carga ni escaneo completo de CVE de las imágenes. Los resultados de npm audit y SonarCloud corresponden a la revisión realizada y pueden cambiar con nuevos avisos.
