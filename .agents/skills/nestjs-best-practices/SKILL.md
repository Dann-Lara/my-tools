---
name: nestjs-best-practices
description: NestJS best practices and architecture patterns for building production-ready applications. This skill should be used when writing, reviewing, or refactoring NestJS code to ensure proper patterns for modules, dependency injection, security, and performance.
license: MIT
metadata:
  author: Kadajett
  version: '1.1.0'
---

# NestJS Best Practices

Comprehensive best practices guide for NestJS applications. Contains 40 rules across 10 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:

- Writing new NestJS modules, controllers, or services
- Implementing authentication and authorization
- Reviewing code for architecture and security issues
- Refactoring existing NestJS codebases
- Optimizing performance or database queries
- Building microservices architectures

## Rule Categories by Priority

| Priority | Category             | Impact      | Prefix    |
| -------- | -------------------- | ----------- | --------- |
| 1        | Architecture         | CRITICAL    | arch-     |
| 2        | Dependency Injection | CRITICAL    | di-       |
| 3        | Error Handling       | HIGH        | error-    |
| 4        | Security             | HIGH        | security- |
| 5        | Performance          | HIGH        | perf-     |
| 6        | Testing              | MEDIUM-HIGH | test-     |
| 7        | Database & ORM       | MEDIUM-HIGH | db-       |
| 8        | API Design           | MEDIUM      | api-      |
| 9        | Microservices        | MEDIUM      | micro-    |
| 10       | DevOps & Deployment  | LOW-MEDIUM  | devops-   |

## Quick Reference

### 1. Architecture (CRITICAL)

- arch-avoid-circular-deps - Avoid circular module dependencies
- arch-feature-modules - Organize by feature, not technical layer
- arch-module-sharing - Proper module exports/imports
- arch-single-responsibility - Focused services over "god services"
- arch-use-repository-pattern - Abstract database logic

### 2. Dependency Injection (CRITICAL)

- di-avoid-service-locator - Avoid service locator anti-pattern
- di-interface-segregation - Interface Segregation Principle
- di-prefer-constructor-injection - Constructor over property injection
- di-scope-awareness - Understand singleton/request/transient scopes

### 3. Error Handling (HIGH)

- error-use-exception-filters - Centralized exception handling
- error-throw-http-exceptions - Use NestJS HTTP exceptions
- error-handle-async-errors - Handle async errors properly

### 4. Security (HIGH)

- security-auth-jwt - Secure JWT authentication
- security-validate-all-input - Validate with class-validator
- security-use-guards - Authentication and authorization guards
- security-rate-limiting - Implement rate limiting

### 5. Performance (HIGH)

- perf-use-caching - Implement caching strategies
- perf-optimize-database - Optimize database queries
- perf-lazy-loading - Lazy load modules for faster startup

### 6. Testing

- test-use-testing-module - Use NestJS testing utilities
- test-e2e-supertest - E2E testing with Supertest

### 7. Database & ORM

- db-use-transactions - Transaction management
- db-avoid-n-plus-one - Avoid N+1 query problems
- db-use-migrations - Use migrations for schema changes

## Key Patterns

### Module Structure

```
src/modules/feature/
├── feature.module.ts
├── feature.service.ts
├── feature.controller.ts
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
└── entities/
    └── feature.entity.ts
```

### Service Pattern

```typescript
@Injectable()
export class FeatureService {
  constructor(
    private readonly repository: FeatureRepository,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<Feature[]> {
    return this.repository.find();
  }
}
```

### Controller Pattern

```typescript
@Controller('features')
@UseGuards(JwtAuthGuard)
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  findAll() {
    return this.service.findAll();
  }
}
```
