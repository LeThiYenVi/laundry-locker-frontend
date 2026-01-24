# Types

This folder contains TypeScript type definitions and interfaces.

## Structure

- **user.ts** - User-related types
- **locker.ts** - Locker-related types
- **order.ts** - Order-related types
- **api.ts** - API request/response types

## Examples

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Locker {
  id: string;
  number: string;
  size: "small" | "medium" | "large";
  status: "available" | "occupied" | "maintenance";
}
```
