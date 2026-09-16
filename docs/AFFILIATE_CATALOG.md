# Integración del catálogo de afiliados

El proyecto desplegable está en `catalogo-afiliados/`. Es independiente de Expo y Vercel debe configurarse con esa carpeta como **Root Directory**.

## Flujo

1. El administrador edita los productos en `/admin`.
2. El servidor valida y guarda el catálogo JSON en Vercel Blob privado.
3. La app consulta `/api/catalog` con el mercado derivado de la región del dispositivo.
4. La app conserva una copia local durante 15 minutos y la utiliza como respaldo si no hay conexión.

`src/utils/affiliate-catalog.js` ya implementa la detección de mercado, validación de URLs, timeout y caché offline. La futura pantalla puede usarlo así:

```js
import { fetchAffiliateCatalog } from "../src/utils/affiliate-catalog";

const catalog = await fetchAffiliateCatalog();
setProducts(catalog.products);
```

Para refresco manual:

```js
await fetchAffiliateCatalog({ forceRefresh: true });
```

En la configuración de compilación de Expo debe existir:

```text
EXPO_PUBLIC_AFFILIATE_CATALOG_URL=https://TU-DOMINIO/api/catalog
```

La región procede de `expo-localization`; no se solicita geolocalización. España tiene su segmento propio. El resto de países europeos se asignan a Europa, los países americanos a América y los países de Asia y Oriente Medio a `east`. Un país fuera de esos cuatro grupos recibe un catálogo vacío; nunca se le muestra por defecto un enlace de otro mercado.

La URL de compra debe abrirse solo tras una acción explícita del usuario y con `Linking.openURL(product.offer.url)`. La pantalla debe mostrar `catalog.disclosure` siempre que haya al menos un producto visible.
