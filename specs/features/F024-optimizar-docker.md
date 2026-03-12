# F024: Optimizar Configuración Docker

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | docker, infrastructure                           |
| **Usuario**     | developer, devops                               |
| **Problema**    | 4 archivos docker-compose, posible redundancia   |
| **Solicitante** | Technical Debt, DevOps                          |
| **Prioridad**   | Media                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | 4 archivos docker-compose      | MEDIUM    | Raíz del proyecto             |
| 2   | Posible redundancia entre archivos | MEDIUM | docker-compose.yml vs *.override.yml |
| 3   | Sin documentar diferencias    | LOW       | Falta documentación           |

### Archivos Existentes

```
docker-compose.yml           # Principal
docker-compose.override.yml  # Override local (dev)
docker-compose.staging.yml   # Staging
docker-compose.prod.yml      # Producción
```

### User Stories

- Como **devops**, quiero entender qué archivo usar en cada entorno
- Como **desarrollador**, quiero configuración clara para local

### Acceptance Criteria

- [ ] **AC01**: Documentar propósito de cada archivo docker-compose
- [ ] **AC02**: Identificar y eliminar redundancias
- [ ] **AC03**: Verificar que servicios necesarios estén correctos
- [ ] **AC04**: Crear guía rápida en docs/

---

## plan (Cómo)

### Tareas

- [ ] **T01**: Analizar cada docker-compose y listar servicios
- [ ] **T02**: Identificar diferencias y redundancias
- [ ] **T03**: Documentar en docs/docker.md
- [ ] **T04**: Eliminar redundancias si las hay
- [ ] **T05**: Verificar que todo funcione

---

## Referencias

- Constitución: `specs/SPEC.md`
- DEPLOYMENT.md si existe

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
