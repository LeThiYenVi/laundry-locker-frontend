# Config

This folder contains configuration files and constants.

## Structure

- **env.ts** - Environment variables
- **api.config.ts** - API endpoints configuration
- **app.config.ts** - App-wide configuration

## Examples

```typescript
// env.ts
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
export const PAYMENT_KEY = process.env.EXPO_PUBLIC_PAYMENT_KEY;

// api.config.ts
export const API_ENDPOINTS = {
  AUTH: "/auth",
  LOCKERS: "/lockers",
  ORDERS: "/orders",
  USERS: "/users",
};
```
