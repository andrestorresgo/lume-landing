# LUMÉ Jewelry - Documentación de Técnicas SEO Aplicadas

Este documento detalla todas las optimizaciones de Posicionamiento en Motores de Búsqueda (SEO) y las estrategias de SEO Programático (pSEO) implementadas en el sitio web de LUMÉ.

---

## 1. SEO Técnico y Semántica HTML
* **Jerarquía de Encabezados Unificada**: Se resolvió el problema de múltiples etiquetas `<h1>` en la página principal (`Hero.astro`). Ahora la página tiene un único `<h1>` semántico:
  ```html
  <h1 class="text-5xl ...">
    Hecho a mano. <span class="block mt-2">Hecho para ti.</span>
  </h1>
  ```
  Esto respeta la directriz de "un solo `<h1>` por página" para mejorar la indexación jerárquica de Google.
* **Directivas de Rastreo (`robots.txt`)**: Se creó el archivo [public/robots.txt](file:///mnt/Data/Dev/Proyectos/Lume/landing/public/robots.txt) para guiar a los bots de búsqueda y declarar explícitamente la ubicación del mapa del sitio.
* **Sitemap Automatizado**: Se instaló la integración oficial `@astrojs/sitemap` y se configuró en [astro.config.mjs](file:///mnt/Data/Dev/Proyectos/Lume/landing/astro.config.mjs). En cada build, Astro genera dinámicamente un archivo de índice (`sitemap-index.xml`) y un mapa de URLs (`sitemap-0.xml`) que contiene la totalidad de las páginas estáticas e indexa de forma automática las rutas dinámicas y de SEO programático.

---

## 2. Metadatos y Datos Estructurados (Schema.org)
* **Componente Reutilizable `<SEOMeta>`**: Se creó el componente [src/components/SEOMeta.astro](file:///mnt/Data/Dev/Proyectos/Lume/landing/src/components/SEOMeta.astro). Este componente gestiona de manera centralizada:
  * Etiquetas de título y descripción meta únicas y optimizadas para palabras clave de intención.
  * Etiquetas OpenGraph (Facebook, Instagram, LinkedIn) y Twitter Cards (`summary_large_image`) utilizando el fondo editorial de la marca como imagen compartible por defecto.
  * Enlaces canónicos dinámicos (`canonical`) autogenerados con el dominio de producción para evitar penalizaciones por contenido duplicado.
  * Inyección dinámica de esquemas de datos estructurados JSON-LD en la cabecera.
* **Esquemas Implementados**:
  * **Página de Inicio**: Esquema híbrido `WebSite` y `Organization` para consolidar el perfil de la marca y vincular su logotipo.
  * **Páginas de Catálogo (Colecciones General y Programáticas)**: Esquema `ItemList` que describe cada producto visible, incluyendo nombre, descripción, precio y disponibilidad (`InStock`). Esto permite que Google muestre resultados enriquecidos (Rich Snippets) directamente en las búsquedas.

---

## 3. SEO Programático (pSEO) a Escala
Siguiendo las directrices del framework `/programmatic-seo`, implementamos una estrategia de **subcarpetas** (para acumular y consolidar la autoridad de dominio en lugar de usar subdominios) enfocada en capturar búsquedas transaccionales de cola larga (long-tail keywords).

### Estructura de URLs y Enrutamiento Dinámico
1. **Colecciones por Piedras**: `/colecciones/piedras/[stone]` (ej. `/colecciones/piedras/cuarzo-claro`)
2. **Colecciones por Intenciones**: `/colecciones/intenciones/[intention]` (ej. `/colecciones/intenciones/proteccion`)

### Implementación Técnica
* **Base de Datos de Redacción Reutilizable**: Se creó [src/data/seoData.json](file:///mnt/Data/Dev/Proyectos/Lume/landing/src/data/seoData.json) con metadatos específicos y copys detallados de valor metafísico e intencional para cada gema y propósito.
* **Pre-renderizado y Filtrado SSR/SSG**: Se refactorizó la lógica en [src/components/CollectionsPage.tsx](file:///mnt/Data/Dev/Proyectos/Lume/landing/src/components/CollectionsPage.tsx) para aceptar las propiedades `initialStone` e `initialIntention`. De esta forma, cuando Astro genera las páginas estáticas en tiempo de build (`getStaticPaths`), el catálogo de React se pre-filtra en el servidor y entrega HTML estático puro con los productos correctos ya renderizados, beneficiando radicalmente a los motores de búsqueda que no ejecutan JavaScript complejo.
* **Prevención de Contenido Vacío (Thin Content)**: Las páginas dinámicas incluyen una sección final en Astro que expone un texto extendido con información enriquecida sobre el significado de la piedra y consejos de bienestar. Esto garantiza que cada página programática aporte valor único y genuino más allá de un simple cambio de variables.
* **Estructura Interna Hub-and-Spoke**: Cada página programática (spoke) contiene enlaces de retroalimentación interna hacia el catálogo principal (hub) y enlaces de interconexión con otros "spokes" de la colección (por ejemplo, la página de *Cuarzo Claro* enlaza a *Ojo de Tigre*, *Roca Volcánica*, etc.), optimizando el flujo del "Link Juice" y facilitando el rastreo de los bots.

---

## 4. Resumen de URLs Indexadas
El sitemap autogenerado registra y valida las siguientes 11 páginas:
1. `https://lume-landing-murex.vercel.app/` (Home)
2. `https://lume-landing-murex.vercel.app/colecciones/` (Catálogo Completo)
3. `https://lume-landing-murex.vercel.app/colecciones/piedras/cuarzo-claro/` (Programmático - Cuarzo)
4. `https://lume-landing-murex.vercel.app/colecciones/piedras/ojo-de-tigre/` (Programmático - Ojo de Tigre)
5. `https://lume-landing-murex.vercel.app/colecciones/piedras/roca-volcanica/` (Programmático - Roca Volcánica)
6. `https://lume-landing-murex.vercel.app/colecciones/piedras/agata/` (Programmático - Ágata)
7. `https://lume-landing-murex.vercel.app/colecciones/intenciones/claridad/` (Programmático - Claridad)
8. `https://lume-landing-murex.vercel.app/colecciones/intenciones/proteccion/` (Programmático - Protección)
9. `https://lume-landing-murex.vercel.app/colecciones/intenciones/fuerza/` (Programmático - Fuerza)
10. `https://lume-landing-murex.vercel.app/colecciones/intenciones/equilibrio/` (Programmático - Equilibrio)
11. `https://lume-landing-murex.vercel.app/colecciones/intenciones/calma/` (Programmático - Calma)
