# Importador visual de inspiración

Herramienta local para elegir fotos guardadas desde Instagram, sueltas o dentro de varios ZIP, asignarles categorías y subirlas optimizadas a WordPress. No necesita Meta API para este flujo. Usa Node.js 20.19 o posterior y el navegador, sin dependencias npm nuevas.

## Preparación de WordPress

1. En WordPress, ve a **Plugins → Añadir nuevo → Subir plugin** e instala `inspiration-importer-wp.zip`. Actívalo. El complemento añade la clasificación y hace visibles los nuevos diseños en el endpoint que ya consume la app.
2. Crea una **contraseña de aplicación** para una cuenta con permiso para subir medios. Usa esa contraseña, no la contraseña habitual de acceso al panel.
3. Copia `.env.example` a `.env.local` en esta carpeta y rellena `WP_USER` y `WP_APP_PASSWORD`. La URL del WordPress ya está configurada. `.env.local` está ignorado por Git y nunca se entrega al navegador.
4. Ejecuta desde la raíz del proyecto: `npm run inspiration:import`. Abre `http://127.0.0.1:8787`.

La versión 0.2.0 añade **Cat eye** (`cat-eye`). Si tienes una versión anterior del complemento, sube el ZIP actualizado y elige **Reemplazar el actual con el subido**. El importador avisa si falta esa actualización y comprueba la compatibilidad antes de subir una foto a Cat eye. La app toma la primera foto de esa galería como portada de la categoría.

La versión **0.3.0** añade el resumen público de categorías actualizadas. La nueva app muestra **NOVEDAD** en las categorías con fotos importadas desde el 29 de septiembre de 2026 (00:00, Madrid). También cuenta las fotos ya subidas con la versión 0.2.0; no hay que volver a subirlas. Las categorías sin fotos nuevas no llevan etiqueta. Se cuentan todas las subidas del periodo, aunque superen las 100 fotos del feed de inicio. Para la siguiente actualización de contenido, cambia `CATEGORY_UPDATE_SINCE` en `src/utils/category-updates.js`. Si el complemento aún no está actualizado o falla la conexión, las categorías siguen funcionando sin la etiqueta.

## Uso sin Meta API

Busca y guarda en tu ordenador las fotos que quieras utilizar. En la página local, elige o arrastra varias fotos y/o varios archivos `.zip`. Verás cada imagen antes de subirla; puedes asignar una categoría a todo un ZIP, cambiarla en una tarjeta concreta o aplicarla a todas las seleccionadas. También puedes pegar el enlace de la publicación original en cada tarjeta.

Al asignar una categoría individual, esa foto queda seleccionada para subir. El botón muestra cuántas imágenes están listas y envía únicamente las seleccionadas que tienen categoría; las demás siguen pendientes. El selector de categoría en bloque es opcional y no hace falta utilizarlo para mezclar categorías en una misma tanda.

Pulsa **Quitar imagen** en las fotos que quieras descartar: desaparecen de la tanda y quedan excluidas de la subida, también al seleccionar todas. Este botón está disponible antes de subirlas y no borra archivos de tu ordenador ni imágenes ya publicadas en WordPress.

Los ZIP se abren en el navegador y no se suben enteros a WordPress. Solo se extraen JPG, PNG y WebP; se omiten los otros archivos y se rechazan ZIP cifrados, dañados o con rutas peligrosas. Límites por tanda: hasta 20 ZIP, 150 imágenes y 250 MB de imágenes descomprimidas; cada ZIP puede ocupar hasta 120 MB y cada imagen hasta 30 MB. Recarga la página para empezar una nueva tanda.

Al pulsar **Optimizar y subir**, cada imagen se reduce a un máximo de 1600 píxeles y se convierte a JPEG de calidad 82 %, se guarda una copia local en `data/` y se envía a WordPress. Después se comprueba si aparece en la galería pública de su categoría. El complemento guarda el enlace original de Instagram cuando se indica. Usa únicamente imágenes que tengas permiso para republicar.

Si una imagen llega a WordPress pero falla la clasificación, la tarjeta muestra su ID de WordPress para recuperarla manualmente. La herramienta no elimina medios ni publicaciones.

El importador calcula una huella del archivo optimizado para evitar subir exactamente la misma imagen dos veces. Si una ya está en WordPress, la interfaz indica su categoría actual.

## Búsqueda automática opcional

Si más adelante configuras Meta Graph API, puedes rellenar `IG_USER_ID` e `IG_ACCESS_TOKEN` en `.env.local`. La sección de búsqueda automática permite consultar hasta 100 publicaciones recientes por cuenta profesional pública y filtrar sus descripciones por un término. Las cuentas personales no están disponibles por esta API. El importador de archivos funciona sin esos datos.

## Límites

- Sin Meta API, la búsqueda dentro de Instagram y el guardado de las fotos se hacen manualmente; la selección, optimización, clasificación y subida se hacen en esta herramienta.
- El complemento de WordPress debe instalarse antes de la primera subida. Está preparado con la estructura pública de la API, pero la subida real requiere una contraseña de aplicación válida en este entorno.
