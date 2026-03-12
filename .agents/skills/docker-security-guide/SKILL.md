---
name: docker-security-guide
description: Docker Security Guide for building secure containers. Use when writing Dockerfiles, docker-compose files, or reviewing container security.
license: MIT
metadata:
  author: Josiah Siegel
  version: '1.0.0'
---

# Docker Security Guide

This skill provides comprehensive security guidelines for Docker across all platforms, covering threats, mitigations, and compliance requirements.

## Security Principles

### Defense in Depth

Apply security at multiple layers:

1. Monitoring: Detection, logging, alerting
2. Orchestration security: Secure configuration, RBAC
3. Host security: Hardened host OS, updated Docker daemon
4. Network security: Isolation, least privilege
5. Runtime security: Restricted capabilities, resource limits
6. Build security: Secure build process, no secrets in layers
7. Image security: Minimal, signed images

## Dockerfile Best Practices

### 1. Use Specific Base Image Tags

```dockerfile
# Bad
FROM node:latest

# Good
FROM node:20-alpine
```

### 2. Run as Non-Root User

```dockerfile
# Create user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
USER nodejs
```

### 3. Use Multi-Stage Builds

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nodejs
CMD ["node", "dist/index.js"]
```

### 4. Don't Expose Secrets in Layers

```dockerfile
# Bad - secrets in image
ENV API_KEY=secret123

# Good - use build args or runtime secrets
ARG API_KEY
# Or use Docker secrets / Kubernetes secrets
```

### 5. Use .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
.env
*.md
docker-compose*.yml
```

## Docker Compose Security

### Health Checks

```yaml
services:
  backend:
    image: myapp/backend
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Resource Limits

```yaml
services:
  backend:
    image: myapp/backend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### User Namespaces

```yaml
services:
  backend:
    image: myapp/backend
    user: '1001:1001'
```

## Network Security

### Network Isolation

```yaml
services:
  backend:
    networks:
      - backend-network

  frontend:
    networks:
      - frontend-network

networks:
  backend-network:
    internal: true
  frontend-network:
```

### Restrict Capabilities

```yaml
services:
  backend:
    image: myapp/backend
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
```

## Image Scanning

### Trivy

```bash
trivy image myapp:latest
trivy image --severity HIGH,CRITICAL myapp:latest
```

### Docker Scout

```bash
docker scout cves myapp:latest
```

## Secrets Management

### Docker Secrets (Swarm)

```bash
echo "mypassword" | docker secret create db_password -
```

```yaml
services:
  db:
    image: postgres:16
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

## Best Practices Checklist

- [ ] Use specific image tags (not latest)
- [ ] Run as non-root user
- [ ] Use multi-stage builds
- [ ] Add health checks
- [ ] Set resource limits
- [ ] Scan images for vulnerabilities
- [ ] Use .dockerignore
- [ ] Don't expose secrets in Dockerfile
- [ ] Use read-only file system when possible
- [ ] Implement network isolation
- [ ] Drop all capabilities
- [ ] Enable Docker Content Trust
