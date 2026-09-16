# Catálogo de afiliación de Ideas de manicura

Este directorio es un proyecto estático independiente para Vercel, siguiendo la arquitectura de `become-attractive/affiliate-config`.

## Qué se edita

El único catálogo comercial es:

```text
public/affiliate/v1/catalog.json
```

La app móvil no incluye una copia de estos productos. La futura funcionalidad descargará este JSON publicado y conservará una caché local. Por tanto, cambiar productos o enlaces requerirá publicar de nuevo este proyecto estático, pero **no requerirá compilar ni publicar una nueva versión de la app**.

La integración móvil todavía no se añade porque la pantalla que utilizará los productos aún no existe. Se implementará junto a esa funcionalidad, con el contrato del catálogo ya definido.

El catálogo comienza vacío y con `enabled:false` porque todavía no hay URLs reales.

## Mercados

Las ofertas se separan en cuatro grupos sin fallback entre ellos:

- `spain`: exclusivamente España.
- `europe`: países europeos excepto España.
- `americas`: Norteamérica, Centroamérica, Caribe y Sudamérica.
- `east`: Asia y Oriente Medio.

África y Oceanía no reciben enlaces automáticamente. Se pueden añadir posteriormente mediante una nueva versión coordinada del contrato.

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
          "url": "https://www.amazon.es/dp/PRODUCTO?tag=AFILIADO",
          "enabled": true,
          "priority": 100
        }
      ],
      "europe": [],
      "americas": [],
      "east": []
    }
  }
}
```

Los IDs (`lampara_uv_led`) son estables y solo admiten minúsculas, números y guiones bajos. Si hay varias ofertas habilitadas para un mercado, se utiliza la de mayor `priority`. `brand`, `description` e `imageUrl` son opcionales; se pueden completar cuando la futura pantalla defina qué información mostrará.

Al publicar productos reales:

1. Añádelos en `products`.
2. Añade solamente enlaces HTTPS completos con sus parámetros de afiliación.
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
