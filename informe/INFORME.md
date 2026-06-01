# Informe de Despliegue Continuo (CI/CD) en AWS S3 y CloudFront

## 1. Descripción del Sitio Web y del Pipeline

### El Sitio Web

El proyecto es una landing page moderna desarrollada con el framework **Astro** y **React**. Está estructurada de forma estática (Static Site Generation - SSG), lo que permite obtener tiempos de carga ultrarrápidos y un rendimiento óptimo.

### El Pipeline de CI/CD (GitHub Actions)

Se configuró un flujo de trabajo automatizado en GitHub Actions (`.github/workflows/deploy.yml`) que realiza las siguientes operaciones en cada `push` a la rama `main`:

1. **Checkout del Código:** Clona el repositorio en la máquina virtual de GitHub Actions.
2. **Configuración de Entorno:** Configura la herramienta de ejecución **Bun** para una instalación y compilación ultrarrápidas.
3. **Instalación de Dependencias y Compilación:** Instala los paquetes del proyecto y ejecuta `bun run build` para compilar el sitio estático en el directorio `/dist`.
4. **Configuración de AWS:** Autentica el pipeline en AWS mediante credenciales y configuraciones dinámicas almacenadas como secretos y variables de repositorio.
5. **Sincronización S3 (`aws s3 sync`):** Sube el contenido de `/dist` al bucket de S3, eliminando los archivos locales borrados en AWS (`--delete`) y excluyendo recursos innecesarios como mapas de fuente (`*.map`), archivos del sistema (`.DS_Store`, `Thumbs.db`) y directorios de Git/GitHub.
6. **Invalidación de Caché en CloudFront:** Solicita la invalidación de la caché global (`/*`) para que los cambios se reflejen de forma inmediata a los usuarios finales.

---

## 2. Capturas de Pantalla

### A. Bucket S3 Creado y Configurado

![[Captura] Bucket S3 configurado en la consola de AWS](images/s3_bucket_configured.png)

### B. Secretos y Variables en GitHub Actions

![[Captura] Secretos y Variables de repositorio configurados](images/github_secrets_variables.png)

### C. Historial de Ejecuciones de GitHub Actions

![[Captura] Historial de ejecuciones en la pestaña Actions](images/github_actions_history.png)

![[Captura] Historial de ejecuciones en la pestaña Actions](images/github_actions_history2.png)

### D. Sitio Web Funcionando y Accesible Públicamente

![[Captura] Sitio web público en producción](images/website_live.png)

### E. Distribución de CloudFront Configurada

![[Captura] Distribución de CloudFront activa en la consola de AWS](images/cloudfront_distribution.png)

---

## 3. URLs Públicas del Proyecto (Placeholders)

* **URL de CloudFront:**
    `https://d3hxpceh3h0bbx.cloudfront.net/`
* **URL del Bucket S3 (Estática - HTTP de Origen):**
    `http://static-site-demo-7552121.s3-website.us-east-2.amazonaws.com`

---

## 4. Conclusiones sobre la Utilidad de CI/CD para Sitios Estáticos

El uso de un pipeline de despliegue continuo (CI/CD) para este tipo de arquitectura estática aporta múltiples beneficios clave:

1. **Automatización y Reducción de Errores:** Elimina la necesidad de construir localmente y subir archivos de forma manual a través de la consola de AWS o clientes FTP. Esto reduce a cero el error humano (por ejemplo, olvidar subir un archivo o subir una versión incorrecta).
2. **Eficiencia en la Entrega (Time-to-Market):** Cada vez que un desarrollador integra cambios validados en la rama `main`, estos se propagan automáticamente al servidor de producción en cuestión de segundos.
3. **Caché Optimizada:** La integración del comando de invalidación de CloudFront garantiza que las actualizaciones del sitio web se sirvan inmediatamente en todo el mundo, sin que los usuarios finales experimenten problemas de caché vieja o desactualizada.
4. **Seguridad Mejorada:** Al separar la configuración en secretos y variables de entorno de repositorio, se evita exponer credenciales críticas de AWS en el código fuente. Asimismo, el uso de OAC restringe las solicitudes públicas directas a S3, protegiendo el origen de posibles accesos no autorizados.
