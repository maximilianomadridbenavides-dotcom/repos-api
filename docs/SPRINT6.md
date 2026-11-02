# Sprint 6: despliegue comprobado en Minikube

Estado: completado el 1 de noviembre de 2026.

## Entorno y resultado

- Perfil y contexto: devops-reto; namespace: reto.
- Kubernetes v1.37.0 sobre Docker Desktop, runtime containerd.
- Helm: repos-api y repos-front en estado deployed.
- Ambos pods: 1/1 Ready, Running, sin reinicios durante la comprobación.
- Imágenes locales repos-api:1.0 y repos-front:1.0, imagePullPolicy Never.
- API disponible en Service repos-api:3000; frontend en repos-front:80.
- Consulta desde el pod del frontend mediante Nginx: ok=true, total=5, cinco elementos.
- Navegador en http://localhost:8080: API conectada, cinco repositorios, búsqueda de kubernetes y filtro JavaScript correctos; actualización correcta.

## Problema investigado y solución

El constructor interno de Minikube no pudo validar el certificado al descargar de Docker Hub. Construimos con Docker Desktop y cargamos las imágenes locales con minikube image load --daemon, método soportado oficialmente. La validación TLS permanece activa.

La carga encontró además un error de permisos al crear archivos de bloqueo en la carpeta temporal. El script usa una carpeta temporal de trabajo bajo LOCALAPPDATA/DevOpsTools/minikube-temp y restaura TEMP y TMP al terminar.

El script comprueba que el nodo esté Ready y la imagen esté cargada antes de instalar con Helm. Se validaron instalación del frontend y actualización de la API usando los scripts corregidos.

## Repetir la demostración

1. Iniciar Docker Desktop y el perfil devops-reto de Minikube.
2. Ejecutar ./deploy-minikube.ps1 en backend y después en frontend.
3. Mantener activo kubectl --context devops-reto -n reto port-forward svc/repos-front 8080:80.
4. Abrir http://localhost:8080.

El acceso del navegador depende de que el equipo, Docker Desktop, Minikube y el port-forward permanezcan activos.

## Pendiente para el cierre del reto

Los sprints 1 a 6 están completados en su alcance de preparación, repositorios, CI, SonarCloud, Docker y despliegue local. Queda consolidar la entrega y preparar la defensa. Los hallazgos abiertos de SonarCloud y las advertencias de dependencias de desarrollo requieren revisión; la aprobación del Quality Gate no significa ausencia de hallazgos.
