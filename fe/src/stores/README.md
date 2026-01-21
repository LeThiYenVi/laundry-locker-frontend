# API Constants & RTK Query Setup

## 📁 File Structure

```
src/
├── constants/
│   ├── api-paths.ts      # API endpoint constants
│   ├── sidebar.ts        # Sidebar navigation constants
│   └── index.ts          # Main exports
├── stores/
│   ├── baseAPi.ts        # Base RTK Query setup
│   ├── apis/
│   │   ├── authApi.ts    # Authentication API endpoints
│   │   └── adminApi.ts   # Admin API endpoints
│   └── store.ts          # Redux store configuration
```

## 🚀 Usage Examples

### 1. Using API Constants

```typescript
import { AUTH_ENDPOINTS, ADMIN_ENDPOINTS, API_BASE_URL } from '../constants';

// Direct usage
const loginUrl = `${API_BASE_URL}${AUTH_ENDPOINTS.EMAIL_VERIFY_OTP}`;
const dashboardUrl = `${API_BASE_URL}${ADMIN_ENDPOINTS.DASHBOARD}`;
```

### 2. Using RTK Query Hooks

```typescript
import { useGetDashboardStatsQuery, useGetUsersQuery } from '../stores/apis/adminApi';
import { useLoginMutation } from '../stores/apis/authApi';

function DashboardComponent() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  // Login mutation
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      await login({ username: 'admin', password: 'admin123' }).unwrap();
      // Success - user is logged in
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {isLoading ? 'Loading...' : (
        <div>Total Users: {stats?.totalUsers}</div>
      )}
    </div>
  );
}
```

### 3. Adding New API Endpoints

```typescript
// 1. Add to api-paths.ts
export const NEW_ENDPOINTS = {
  EXAMPLE: `${ROOT_URI.ADMIN}/example`,
} as const;

// 2. Add to apis/yourApi.ts
export const yourApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExample: builder.query<any, void>({
      query: () => NEW_ENDPOINTS.EXAMPLE,
    }),
  }),
});

// 3. Export hooks
export const { useGetExampleQuery } = yourApi;
```

## 🔧 Environment Variables

Create `.env` file in project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 📋 Available API Endpoints

### Authentication
- `AUTH_ENDPOINTS.PHONE_LOGIN`
- `AUTH_ENDPOINTS.EMAIL_SEND_OTP`
- `AUTH_ENDPOINTS.EMAIL_VERIFY_OTP`
- `AUTH_ENDPOINTS.REFRESH_TOKEN`
- `AUTH_ENDPOINTS.LOGOUT`

### User
- `USER_ENDPOINTS.PROFILE`
- `USER_ENDPOINTS.DASHBOARD`

### Admin
- `ADMIN_ENDPOINTS.DASHBOARD`
- `ADMIN_ENDPOINTS.USERS`
- `ADMIN_ENDPOINTS.LOCKERS`
- `ADMIN_ENDPOINTS.ORDERS`
- `ADMIN_ENDPOINTS.ANALYTICS`
- `ADMIN_ENDPOINTS.SETTINGS`

## 🏷️ RTK Query Tags

Available tags for cache invalidation:
- `"Auth"` - Authentication related
- `"User"` - User data
- `"Admin"` - Admin data

## 🔄 Auto-generated Hooks

All RTK Query endpoints automatically generate:
- **Queries**: `useGetXQuery` (for GET requests)
- **Mutations**: `useXMutation` (for POST/PUT/DELETE requests)

Example:
```typescript
// Query hook
const { data, isLoading, error } = useGetUsersQuery(params);

// Mutation hook
const [updateUser, { isLoading }] = useUpdateUserMutation();
```