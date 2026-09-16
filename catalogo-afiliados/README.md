# Catálogo de afiliados

Aplicación web independiente para Vercel. Incluye:

- catálogo público por mercado: España, Europa, América y Oriente;
- panel privado en `/admin` para crear, editar, ocultar y borrar productos;
- un enlace y precio opcional distintos por mercado;
- API pública para la app móvil en `/api/catalog`;
- persistencia en un Vercel Blob privado, sin recompilar la app ni redesplegar este proyecto al editar;
- control de concurrencia: una sesión antigua no puede sobrescribir cambios más recientes.

## Desarrollo local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Define `ADMIN_PASSWORD` (12 o más caracteres) y `SESSION_SECRET` (32 o más). Sin `BLOB_READ_WRITE_TOKEN`, el desarrollo usa `data/catalog.local.json`, ignorado por Git.

## Despliegue en Vercel

1. Crea un proyecto Vercel desde este repositorio y configura **Root Directory** como `catalogo-afiliados`.
2. En **Storage**, crea un almacén **Blob privado** y conéctalo al proyecto. Vercel añadirá `BLOB_READ_WRITE_TOKEN`.
3. Añade `ADMIN_PASSWORD` y `SESSION_SECRET` a Production, Preview y Development. Para generar el secreto puedes usar `openssl rand -base64 48`.
4. Despliega y entra en `https://TU-DOMINIO/admin`.
5. En la app Expo define una vez `EXPO_PUBLIC_AFFILIATE_CATALOG_URL=https://TU-DOMINIO/api/catalog` y genera la versión que incorpore la nueva funcionalidad.

Después de esa integración inicial, todos los cambios hechos en el panel se entregan por API. Vercel Blob y el endpoint usan una caché de 60 segundos, por lo que una edición puede tardar aproximadamente un minuto en ser visible.

## Contrato de la API

Por código ISO de país:

```text
GET /api/catalog?country=ES
GET /api/catalog?country=MX
GET /api/catalog?country=AE
```

O por segmento explícito:

```text
GET /api/catalog?market=spain
GET /api/catalog?market=europe
GET /api/catalog?market=americas
GET /api/catalog?market=east
```

La respuesta solo contiene productos publicados que tengan oferta para ese mercado. Cada producto lleva una única propiedad `offer`; nunca se exponen al cliente los enlaces de los demás mercados.

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-09-16T12:00:00.000Z",
  "market": "spain",
  "marketLabel": "España",
  "disclosure": "Algunos enlaces son de afiliado…",
  "products": [
    {
      "id": "lampara-uv-led",
      "name": "Lámpara UV/LED",
      "brand": "Marca",
      "description": "Secado rápido",
      "category": "Herramientas",
      "imageUrl": "https://example.com/lampara.jpg",
      "active": true,
      "priority": 10,
      "market": "spain",
      "offer": {
        "url": "https://tienda.example/producto?tag=afiliado",
        "store": "Tienda",
        "price": 29.99,
        "currency": "EUR"
      }
    }
  ]
}
```

## Comprobaciones

```bash
npm run test
npm run typecheck
npm run build
```

Las imágenes se referencian mediante URL HTTPS; el catálogo no copia imágenes de terceros. Los enlaces deben conservar los parámetros de atribución de la red de afiliación. Mantén visible el aviso de afiliación en cualquier pantalla nueva que use estos datos.
