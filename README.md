# Prestige Barber

Sitio de la barbería con agenda online (`/agendar`) y panel de métricas (`/dashboard`).
Next.js 16 + Prisma 7 + PostgreSQL (Neon).

## Puesta en marcha

```bash
npm install            # también genera el cliente de Prisma
cp .env.example .env   # pon en DATABASE_URL el string de conexión de Neon
npm run db:migrate     # crea las tablas en la base
npm run db:seed        # carga barberos, servicios y ~200 días de citas simuladas
npm run dev
```

| Script | Qué hace |
| --- | --- |
| `npm run db:migrate` | Aplica/crea migraciones (`prisma migrate dev`) |
| `npm run db:seed` | Borra y vuelve a cargar los datos de ejemplo |
| `npm run db:reset` | Borra la base, aplica migraciones y corre el seed |
| `npm run db:studio` | Abre Prisma Studio para ver/editar los datos |

## Rutas

- `/agendar` — reserva en 4 pasos. Solo muestra barberos, días y horas con disponibilidad.
- `/dashboard` — métricas por barbero (ingresos, citas, ocupación, cancelaciones, clientes,
  servicios). No está enlazado desde el sitio. Si defines `DASHBOARD_KEY`, se entra con
  `/dashboard?key=<valor>`; sin la clave responde 404.

### API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/catalog` | Barberos y servicios activos |
| GET | `/api/availability?serviceId=1` | Horas libres de los próximos 14 días por barbero |
| POST | `/api/appointments` | Crea una reserva (`barberId: null` = cualquier barbero). 409 si la hora se ocupó |
| DELETE | `/api/appointments/:id` | Cancela una reserva (queda en el historial) |
| GET | `/api/metrics?days=30&barberId=2` | Métricas del panel (`key` o header `x-dashboard-key` si hay `DASHBOARD_KEY`) |

Los errores tienen la forma `{ "error": { "code", "message" } }`.

## Arquitectura

```
src/server/                  backend aislado (no depende de React)
  domain/                    tipos, reglas de agenda, fechas y errores (código puro)
  repositories/types.ts      interfaces de persistencia
  repositories/prisma.ts     implementación con Prisma
  services/                  lógica de negocio: reservas, métricas, catálogo, correo
  container.ts               conecta implementaciones concretas (único punto a cambiar)
  http.ts                    traduce errores de dominio a respuestas HTTP
src/app/api/                 rutas HTTP delgadas que llaman a los servicios
src/lib/api-client.ts        el frontend solo habla con la API por aquí
prisma/                      esquema, migraciones y seed
```

Las fechas de las citas se guardan como `YYYY-MM-DD` + minuto de inicio en horario local de la
barbería (`SHOP_TIMEZONE`), así no dependen de la zona horaria del servidor.

### Base de datos

La base es PostgreSQL en [Neon](https://neon.tech), conectada con `@prisma/adapter-pg`
(`src/server/db.ts`). `DATABASE_URL` puede ser el string con `-pooler` que entrega Neon.
La reserva de horas corre en una transacción `Serializable`, así dos clientes no pueden tomar
la misma hora aunque reserven al mismo tiempo.

### Separar el backend

`src/server` no importa nada de React y las pantallas usan `src/lib/api-client.ts`. Para mover
la API a otro servicio (Express, Fastify, etc.), copia `src/server` y expón los mismos endpoints;
luego define `NEXT_PUBLIC_API_URL` con la URL del nuevo backend.
