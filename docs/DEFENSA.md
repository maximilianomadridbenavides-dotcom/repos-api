# Guía de defensa y demostración

## Presentación sugerida (6–8 minutos)

1. Objetivo (30 segundos): preparé dos componentes independientes para un flujo DevOps verificable, desde GitHub hasta Kubernetes local.
2. Repositorios y CI (90 segundos): mostrar ambos repositorios y una ejecución aprobada. Explicar push/PR, instalación reproducible, pruebas, LCOV, SonarCloud y construcción Docker sin publicar imágenes.
3. Calidad (60 segundos): mostrar cobertura y Quality Gate en cada proyecto. Las pruebas generan LCOV; SonarCloud lo importa. El perfil Sonar way define reglas; el Gate decide si el análisis pasa. El mínimo global se exige adicionalmente en c8.
4. Contenedores y Helm (60 segundos): mostrar Dockerfiles, usuarios sin root, puertos y charts. Explicar imagePullPolicy Never y los Services internos.
5. Demostración (90 segundos): mostrar pods 1/1, abrir el catálogo y probar búsqueda de kubernetes, filtro JavaScript y Actualizar. Confirmar cinco repositorios con GET /api/repositorios.
6. Problema resuelto (60 segundos): explicar certificados en Minikube, carga de imágenes desde Docker Desktop y bloqueo de temporales. Mostrar el script y docs/SPRINT6.md.
7. Cierre (30 segundos): distinguir validación de CI y ejecución local; señalar las evidencias y los límites documentados.

## Arquitectura que debes poder explicar

Navegador -> port-forward localhost:8080 -> Service repos-front:80 -> Nginx:8080 -> Service repos-api:3000 -> API Node.js -> JSON fijo.

Las llamadas /api se realizan al mismo origen del frontend; Nginx las reenvía dentro del clúster. El navegador no necesita resolver el nombre interno repos-api.

## Preguntas frecuentes

**¿Por qué dos repositorios?** Cada componente tiene su propio historial, pipeline, cobertura, proyecto Sonar y despliegue.

**¿Qué garantiza npm ci?** Instala las versiones resueltas en package-lock.json y falla si el manifiesto y el lock no coinciden. --ignore-scripts evita ejecutar scripts de instalación de dependencias; las pruebas se ejecutan explícitamente.

**¿Qué pasa si falla una prueba o el Gate?** La pipeline falla y no alcanza la construcción posterior de Docker. No se ignora el error del escáner.

**¿Por qué la cobertura local y la de Sonar pueden diferir?** c8 muestra por separado líneas y ramas; Sonar combina líneas y condiciones y utiliza su propio conjunto de líneas ejecutables. Hay que comparar el mismo alcance.

**¿Por qué nunca descargar la imagen al desplegar?** Para usar exactamente las imágenes locales cargadas en Minikube. Never implica que una imagen ausente produce ErrImageNeverPull.

**¿Readiness y liveness?** Readiness decide cuándo un pod puede recibir tráfico; liveness detecta un proceso sin respuesta y permite reiniciarlo.

**¿Qué hace Helm?** Renderiza los valores del chart y administra una release de recursos Kubernetes. --wait espera disponibilidad y --atomic revierte un despliegue fallido.

**¿Por qué Nginx usa 8080 y el Service 80?** El proceso sin root escucha en un puerto alto y el Service presenta el puerto estable 80 a sus clientes.

**¿Cómo resuelves un fallo?** Revisar get pods, describe pod, eventos y logs; verificar imagen/tag, namespace, Service/selector, puertos y salud del backend antes de atribuirlo al frontend.

## Comandos durante la demostración

```powershell
kubectl --context devops-reto get nodes
kubectl --context devops-reto -n reto get pods,svc
helm list --kube-context devops-reto -n reto
kubectl --context devops-reto -n reto logs deployment/repos-api --tail=20
kubectl --context devops-reto -n reto port-forward svc/repos-front 8080:80
```

En otra ventana: Invoke-RestMethod http://localhost:8080/api/repositorios.

## Antes de presentar

- Docker Desktop activo, perfil devops-reto listo y equipo conectado a corriente.
- Ejecutar la demostración una vez; no depender de descargar imágenes durante la exposición.
- Abrir repositorios, ejecuciones aprobadas y análisis SonarCloud.
- Mantener el port-forward activo; si el pod cambia, reiniciarlo.
- Tener a mano las evidencias locales y explicar con tus propias palabras las decisiones anteriores.
