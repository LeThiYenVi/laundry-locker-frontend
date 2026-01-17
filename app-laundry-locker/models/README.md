# Models

This folder contains business logic models and data structures.

## Structure

- **User.model.ts** - User business logic
- **Locker.model.ts** - Locker business logic
- **Order.model.ts** - Order business logic

## Examples

```typescript
// User.model.ts
export class UserModel {
  constructor(data: User) { ... }

  getFullName(): string { ... }
  isVerified(): boolean { ... }
  canRentLocker(): boolean { ... }
}
```
