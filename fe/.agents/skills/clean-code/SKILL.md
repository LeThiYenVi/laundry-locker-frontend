---
name: clean-code
description: Clean code guidelines for React/JavaScript projects. Use when writing new components, refactoring existing code, reviewing code quality, or establishing coding standards. Focuses on maintainable, scalable code with Lucide icons only.
---

# Clean Code - React/JavaScript

Clean code guidelines for React projects. No TypeScript. Lucide icons only.

## Quick Start

```jsx
// Good component structure
import { useState, useCallback } from 'react';
import { User, Mail, Lock } from 'lucide-react';

// 1. Named exports
// 2. Props destructuring
// 3. Custom hooks for logic
// 4. Early returns for loading/errors
export function UserCard({ user, onUpdate, className }) {
  const { isLoading, handleUpdate } = useUserUpdate(onUpdate);
  
  if (!user) return null;
  if (isLoading) return <Spinner />;
  
  return (
    <div className={className}>
      <User size={20} />
      <span>{user.name}</span>
    </div>
  );
}
```

## Component Structure

### File Organization

```jsx
// 1. Imports: React -> Libraries -> Components -> Utils -> Styles
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from './Button';
import { formatDate } from '../utils/date';
import './UserProfile.css';

// 2. Constants
const MAX_RETRY = 3;
const DEBOUNCE_MS = 300;

// 3. Helper functions (outside component)
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 4. Custom hooks (below helpers, above component)
function useUserData(userId) {
  return useQuery(['user', userId], fetchUser);
}

// 5. Component
export function UserProfile({ userId, onLogout }) {
  // Hooks first
  const { data, isLoading } = useUserData(userId);
  const [isEditing, setIsEditing] = useState(false);
  
  // Handlers
  const handleSave = useCallback((values) => {
    // logic
  }, []);
  
  // Early returns
  if (isLoading) return <Skeleton />;
  if (!data) return <EmptyState />;
  
  // Render
  return (
    <div className="user-profile">
      {/* JSX */}
    </div>
  );
}

// 6. Default export (if needed)
export default UserProfile;
```

### Component Rules

| Rule | Do | Don't |
|------|-----|-------|
| **Size** | < 150 lines | 300+ line monsters |
| **Props** | < 7 props | 15+ props |
| **Nesting** | Max 3 levels | 6+ nested divs |
| **Exports** | Named exports | Default exports |
| **Icons** | Lucide only | Mixing icon libs |

## Naming Conventions

```jsx
// Components: PascalCase
function UserProfile() {}
function OrderListItem() {}

// Hooks: camelCase with use prefix
function useAuth() {}
function useFormValidation() {}

// Handlers: handle + Event
const handleClick = () => {};
const handleSubmit = () => {};
const handleUserSelect = () => {};

// Booleans: is/has/should/can prefix
const isLoading = true;
const hasError = false;
const shouldShowModal = true;
const canSubmit = false;

// Arrays: plural nouns
const users = [];
const orderItems = [];

// Functions: verb + noun
const getUserById = () => {};
const validateEmail = () => {};
const formatCurrency = () => {};
```

## Props Patterns

```jsx
// 1. Destructure in parameters
function Button({ children, variant = 'primary', onClick, disabled, icon: Icon }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

// 2. Spread only when necessary
function Card({ title, ...props }) {
  return (
    <div {...props}>
      <h3>{title}</h3>
    </div>
  );
}

// 3. Rest props for wrapper components
function InputField({ label, error, className, ...inputProps }) {
  return (
    <div className={className}>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span>{error}</span>}
    </div>
  );
}

// 4. Compound components for complex UI
function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }) { /* */ };
Tabs.Tab = function Tab({ value, children }) { /* */ };
Tabs.Panel = function TabPanel({ value, children }) { /* */ };

// Usage:
// <Tabs defaultTab="settings">
//   <Tabs.List>
//     <Tabs.Tab value="settings">Settings</Tabs.Tab>
//   </Tabs.List>
//   <Tabs.Panel value="settings">...</Tabs.Panel>
// </Tabs>
```

## State Management

```jsx
// 1. Group related state
// Bad
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');

// Good
const [user, setUser] = useState({
  firstName: '',
  lastName: '',
  email: ''
});

// 2. useReducer for complex state
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // ...
}

// 3. Custom hooks for reusable logic
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}
```

## Performance Optimization

```jsx
// 1. Memoize expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// 2. Memoize callback props
const handleSubmit = useCallback((values) => {
  api.submit(values);
}, []);

// 3. Memoize components that receive objects/arrays
const MemoizedUserList = memo(function UserList({ users, onSelect }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onSelect(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
});

// 4. Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Event Handling

```jsx
// 1. Inline for simple cases
<button onClick={() => setIsOpen(true)}>Open</button>

// 2. Handler function for logic
function UserForm({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(Object.fromEntries(formData));
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// 3. Currying for params
const handleUserClick = (userId) => (e) => {
  e.stopPropagation();
  navigate(`/users/${userId}`);
};

// Usage: <button onClick={handleUserClick(user.id)} />

// 4. Debounce for search/input
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debounced;
}
```

## Conditional Rendering

```jsx
// 1. Early returns (preferred)
function UserList({ users, isLoading, error }) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!users?.length) return <EmptyState />;
  
  return <ul>...</ul>;
}

// 2. Ternary for simple cases
{isAdmin ? <AdminPanel /> : <UserPanel />}

// 3. && for single condition
{showBanner && <Banner />}

// 4. Object map for multiple conditions
const statusComponents = {
  loading: <Spinner />,
  error: <ErrorMessage />,
  success: <SuccessView />,
  empty: <EmptyState />
};

function StatusWrapper({ status }) {
  return statusComponents[status] || <DefaultView />;
}
```

## Icon Usage (Lucide Only)

```jsx
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight,
  Check,
  X,
  Trash2,
  Edit3,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Consistent sizing
const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
};

// Usage patterns
<Button icon={Plus}>Add New</Button>
<Alert icon={AlertCircle} type="error">Error message</Alert>
<UserAvatar icon={User} />
```

## File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   └── index.js     # Barrel export
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components
│   └── shared/          # Shared feature components
├── hooks/
│   ├── useAuth.js
│   ├── useForm.js
│   └── index.js
├── utils/
│   ├── format.js
│   ├── validate.js
│   └── index.js
├── constants/
│   └── api.js
├── contexts/
│   └── AuthContext.jsx
└── pages/
    ├── Home.jsx
    └── Profile.jsx
```

## Anti-patterns to Avoid

```jsx
// ❌ Props drilling
// ❌ useEffect for derived state
// ❌ Inline object/array in render
// ❌ Index as key in lists
// ❌ Mutating state directly
// ❌ Async without cleanup
// ❌ Boolean props with ={true}
// ❌ Mixing icon libraries

// Good
<Button disabled />

// Bad
<Button disabled={true} />
```

## Advanced Patterns

See [references/react-patterns.md](references/react-patterns.md) for:
- Render props pattern
- Higher-order components
- Custom hooks library
- Compound components deep dive
- State machines
