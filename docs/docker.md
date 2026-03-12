# Docker Configuration Guide

> Quick reference for Docker Compose usage in this project.

---

## Archivos

| Archivo | Propósito | Cuándo usar |
|---------|-----------|--------------|
| `docker-compose.yml` | Configuración base | Siempre |
| `docker-compose.override.yml` | Dev overrides (hot reload) | Desarrollo local (automático) |
| `docker-compose.staging.yml` | Staging overrides | Staging environment |
| `docker-compose.prod.yml` | Production overrides | Producción |

---

## Uso

### Desarrollo Local (Automático)
```bash
docker compose up -d
```
Carga automáticamente `docker-compose.override.yml` con hot reload.

### Staging
```bash
docker compose --env-file .env.staging \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  up -d
```

### Producción
```bash
docker compose --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d
```

---

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| postgres | 5432 | PostgreSQL 16 |
| redis | 6379 | Redis 7 |
| n8n | 5678 | n8n automation |
| backend | 3001 | NestJS API |
| frontend | 3000 | Next.js App |

---

## Notas

- Todos los valores sensitivos vienen del archivo `.env.*`
- Staging y Production no exponen puertos de DB/Redis directamente
- Los override files solo cambian lo necesario (build target, restart policy)
