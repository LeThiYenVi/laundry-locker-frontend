# Context

This folder contains React Context providers for global state management.

## Structure

- **AuthContext.tsx** - Authentication state
- **LockerContext.tsx** - Locker state management
- **ThemeContext.tsx** - Theme and appearance

## Examples

```typescript
// AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // ... authentication logic
  return (
    <AuthContext.Provider value={{ user, setUser }}>...</AuthContext.Provider>
  );
};
```
