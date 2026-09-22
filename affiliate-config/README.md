# Catálogo de afiliación de Ideas de manicura

Este directorio es un proyecto estático independiente para Vercel, siguiendo la arquitectura de `become-attractive/affiliate-config`.

## Catálogos

- `public/affiliate/v1/catalog.json`: catálogo histórico de España. Se conserva sin cambios para las versiones antiguas de la app.
- `public/affiliate/v2/catalog.json`: catálogo activo para España, Francia, Alemania, Estados Unidos, Reino Unido e Italia.

La app descarga el catálogo V2 y mantiene una caché local. Los productos y enlaces pueden cambiarse publicando de nuevo este proyecto estático, sin compilar una nueva versión de la app, siempre que se mantenga el contrato V2.

## Selección de tienda

No hay fallback entre países. La región del dispositivo selecciona exclusivamente este mercado:

| Región | Mercado | Tienda | ID de afiliado |
| --- | --- | --- | --- |
| `ES` | `spain` | `amazon.es` | `paulaymanu113-21` |
| `FR` | `france` | `amazon.fr` | `paulaymanu105-21` |
| `DE` | `germany` | `amazon.de` | `paulaymanu102-21` |
| `US` | `united_states` | `amazon.com` | `paulaymanu-20` |
| `GB` | `united_kingdom` | `amazon.co.uk` | `paulaymanu100-21` |
| `IT` | `italy` | `amazon.it` | `paulaymanu10d-21` |

En otras regiones la lista de materiales se mantiene visible, pero no aparecen botones comerciales.

## Ofertas

Cada producto mantiene el mismo ID estable en todos los países. Una oferta puede usar:

- un producto concreto: `https://www.amazon.fr/dp/ASIN?tag=ID_AFILIADO`;
- una búsqueda específica de Amazon: `https://www.amazon.fr/s?k=terminos+del+producto&tag=ID_AFILIADO`.

Las búsquedas se usan cuando no existe un ASIN común verificable en ese marketplace: permiten mostrar el mismo producto o el equivalente más próximo disponible en la tienda oficial del país. Si se localiza un producto concreto, se puede sustituir la búsqueda por su URL `/dp/ASIN` sin actualizar la app.

Si hay varias ofertas habilitadas para un producto y mercado, la app elige la de mayor `priority`. Para retirar una oferta basta con usar `enabled: false`. Para apagar todo el catálogo, cambia el `enabled` superior a `false`.

## Validación

El validador exige para cada oferta habilitada:

- HTTPS y dominio oficial del mercado;
- retailer correspondiente al país;
- ruta canónica `/dp/ASIN` o `/s?k=...`;
- ID de afiliado exacto del país;
- mercado declarado en `supportedMarkets`.

Ejecuta desde la raíz del repositorio:

```powershell
npm run validate:affiliate
npm run test:affiliate
```

Antes de publicar un cambio, actualiza también `updatedAt`.

## Vercel

- Root Directory: `affiliate-config`
- Framework Preset: `Other`
- Build Command y Output Directory: se leen de `vercel.json`

La URL activa es:

```text
https://TU-DOMINIO/affiliate/v2/catalog.json
```

La configuración de Expo/EAS debe usar esa misma ruta en `EXPO_PUBLIC_AFFILIATE_CATALOG_URL`.
