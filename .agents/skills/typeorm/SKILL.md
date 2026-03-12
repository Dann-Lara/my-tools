---
name: typeorm
description: TypeORM Development Guidelines for TypeScript and database design. Use when working with TypeORM entities, repositories, migrations, and database operations.
license: MIT
metadata:
  author: Mindrally
  version: '1.0.0'
---

# TypeORM Development Guidelines

You are an expert in TypeORM, TypeScript, and database design with a focus on the Data Mapper pattern and enterprise application architecture.

## Core Principles

- First-class support for database migrations
- Works in Node.js, Browser, Ionic, Cordova, React Native, Expo, and Electron
- Supports MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, and more
- Uses TypeScript decorators for entity and column definitions
- TypeORM supports both Active Record and Data Mapper patterns

## TypeScript Configuration

Required settings in tsconfig.json:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

## Entity Definition

### Basic Entity

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

## Relationships

### One-to-Many

```typescript
@OneToMany(() => Post, (post) => post.author)
posts!: Post[];
```

### Many-to-One

```typescript
@ManyToOne(() => User, (user) => user.posts)
@JoinColumn({ name: 'author_id' })
author!: User;
```

### Many-to-Many

```typescript
@ManyToMany(() => Category)
@JoinTable()
categories!: Category[];
```

## Repository Pattern

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }
}
```

## Transactions

```typescript
async function createUserWithPosts(userData: CreateUserDto, posts: CreatePostDto[]) {
  return this.dataSource.transaction(async (manager) => {
    const user = await manager.save(User, userData);
    const createdPosts = await manager.save(
      Post,
      posts.map((p) => ({ ...p, author: user })),
    );
    return { user, posts: createdPosts };
  });
}
```

## Migrations

### Generate Migration

```bash
typeorm migration:generate -d src/data-source.ts src/migrations/UserTable
```

### Run Migrations

```bash
typeorm migration:run -d src/data-source.ts
```

## Indexes

```typescript
@Entity()
@Index(['email'], { unique: true })
@Index(['createdAt', 'isActive'])
export class User {
  // ...
}
```

## Best Practices

1. Use Data Mapper pattern for enterprise applications
2. Always use migrations for schema changes
3. Avoid N+1 queries - use eager loading or relations
4. Use transactions for multi-table operations
5. Add indexes for frequently queried columns
6. Use proper column types (varchar, int, boolean, etc.)
