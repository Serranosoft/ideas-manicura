# Catálogo de afiliación de Ideas de manicura

Este directorio es un proyecto estático independiente para Vercel, siguiendo la arquitectura de `become-attractive/affiliate-config`.

## Qué se edita

El único catálogo comercial es:

```text
public/affiliate/v1/catalog.json
```

La app móvil no incluye una copia de estos productos. La pantalla inicial de cada guía descarga este JSON y conserva una caché local. Por tanto, cambiar productos o enlaces requiere publicar de nuevo este proyecto estático, pero **no requiere compilar ni publicar una nueva versión de la app**.

Los botones de afiliación solo se muestran cuando la región del dispositivo es España. En los demás países se mantiene la lista de materiales sin enlaces comerciales.

El catálogo de España está activo con una selección inicial de productos de Amazon. Los enlaces usan el identificador de afiliado `paulaymanu113-21` y el validador comprueba que no se publique por error un enlace de Amazon España sin ese identificador.

## Mercados

Las ofertas pueden separarse en cuatro grupos sin fallback entre ellos:

- `spain`: exclusivamente España.
- `europe`: países europeos excepto España.
- `americas`: Norteamérica, Centroamérica, Caribe y Sudamérica.
- `east`: Asia y Oriente Medio.

África y Oceanía no reciben enlaces automáticamente. Se pueden añadir posteriormente mediante una nueva versión coordinada del contrato.

En esta primera fase, `supportedMarkets` solo contiene `spain`. Los demás mercados se activarán cuando tengan productos y enlaces reales.

## Añadir un producto

Ejemplo de estructura. No copies estas URLs ficticias al catálogo real:

```json
{
  "lampara_uv_led": {
    "displayName": "Lámpara UV/LED",
    "brand": "Marca",
    "category": "lamparas",
    "description": "Lámpara para secado de esmalte semipermanente.",
    "imageUrl": "https://cdn.example.com/lampara.jpg",
    "offers": {
      "spain": [
        {
          "retailer": "Amazon España",
          "url": "https://www.amazon.es/dp/B012345678?tag=paulaymanu113-21",
          "enabled": true,
          "priority": 100
        }
      ]
    }
  }
}
```

Los IDs (`lampara_uv_led`) son estables y solo admiten minúsculas, números y guiones bajos. Si hay varias ofertas habilitadas para un mercado, se utiliza la de mayor `priority`. `brand`, `description` e `imageUrl` son opcionales; la app utiliza el nombre del producto y la oferta activa.

Al publicar productos reales:

1. Añádelos en `products`.
2. Para Amazon España, usa el formato canónico `https://www.amazon.es/dp/ASIN?tag=paulaymanu113-21`.
3. Cambia `updatedAt` a la fecha actual.
4. Pon `enabled:true` cuando el catálogo esté listo.
5. Ejecuta `npm run validate`.
6. Haz commit y push; Vercel publicará el JSON actualizado.

Para retirar todos los productos sin actualizar la app, cambia únicamente `enabled` a `false`, actualiza `updatedAt` y vuelve a desplegar.

## Validación local

```powershell
cd E:\PROGRAMACION\ideas-manicura\affiliate-config
npm ci
npm run validate
```

## Vercel

Al crear el proyecto:

- Root Directory: `affiliate-config`
- Framework Preset: `Other`
- Build Command y Output Directory: se leen de `vercel.json`

La URL resultante será:

```text
https://TU-DOMINIO/affiliate/v1/catalog.json
```

Configúrala una sola vez en Expo/EAS:

```text
EXPO_PUBLIC_AFFILIATE_CATALOG_URL=https://TU-DOMINIO/affiliate/v1/catalog.json
```

Esa configuración inicial sí necesita una nueva compilación de la app. Después, los cambios compatibles del JSON no.
