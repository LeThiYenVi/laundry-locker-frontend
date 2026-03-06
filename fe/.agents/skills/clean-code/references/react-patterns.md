# React Patterns Reference

Advanced React patterns for scalable applications.

## Render Props

```jsx
// MouseTracker.jsx
export function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return render(position);
}

// Usage
<MouseTracker render={({ x, y }) => (
  <div>Mouse: {x}, {y}</div>
)} />
```

## Higher-Order Components

```jsx
// withAuth.jsx
export function withAuth(Component) {
  return function AuthWrapper(props) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} user={user} />;
  };
}

// Usage
export default withAuth(Dashboard);
```

## Custom Hooks Library

```jsx
// useFetch.js
export function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch(error => {
        if (!cancelled) setState({ data: null, isLoading: false, error });
      });
    
    return () => { cancelled = true; };
  }, [url]);
  
  return state;
}

// useToggle.js
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  const setOn = useCallback(() => setValue(true), []);
  const setOff = useCallback(() => setValue(false), []);
  return { value, toggle, setOn, setOff };
}

// usePrevious.js
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

// useClickOutside.js
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}

// useMediaQuery.js
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
```

## Compound Components

```jsx
// Select/
const SelectContext = createContext();

function Select({ children, defaultValue, onChange }) {
  const [selected, setSelected] = useState(defaultValue);
  
  const select = useCallback((value) => {
    setSelected(value);
    onChange?.(value);
  }, [onChange]);
  
  return (
    <SelectContext.Provider value={{ selected, select }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

function Trigger({ children }) {
  const { selected } = useContext(SelectContext);
  return <button className="select-trigger">{children || selected}</button>;
}

function Menu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return isOpen ? <div className="select-menu">{children}</div> : null;
}

function Option({ value, children }) {
  const { selected, select } = useContext(SelectContext);
  return (
    <div 
      className={selected === value ? 'selected' : ''}
      onClick={() => select(value)}
    >
      {children}
    </div>
  );
}

Select.Trigger = Trigger;
Select.Menu = Menu;
Select.Option = Option;

export { Select };

// Usage
<Select defaultValue="option1" onChange={console.log}>
  <Select.Trigger />
  <Select.Menu>
    <Select.Option value="option1">Option 1</Select.Option>
    <Select.Option value="option2">Option 2</Select.Option>
  </Select.Menu>
</Select>
```

## State Machines

```jsx
// Simple state machine hook
function useMachine(machine) {
  const [state, setState] = useState(machine.initial);
  const [context, setContext] = useState(machine.context);
  
  const send = useCallback((event) => {
    const currentState = machine.states[state];
    const transition = currentState.on?.[event.type];
    
    if (transition) {
      setState(transition.target);
      if (transition.action) {
        setContext(ctx => transition.action(ctx, event));
      }
    }
  }, [state, machine]);
  
  return { state, context, send };
}

// Usage
const fetchMachine = {
  initial: 'idle',
  context: { data: null, error: null },
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      on: { 
        SUCCESS: { target: 'success', action: (ctx, e) => ({ ...ctx, data: e.data }) },
        ERROR: { target: 'error', action: (ctx, e) => ({ ...ctx, error: e.error }) }
      }
    },
    success: {
      on: { FETCH: 'loading' }
    },
    error: {
      on: { RETRY: 'loading' }
    }
  }
};

function DataFetcher({ api }) {
  const { state, context, send } = useMachine(fetchMachine);
  
  useEffect(() => {
    if (state === 'loading') {
      api()
        .then(data => send({ type: 'SUCCESS', data }))
        .catch(error => send({ type: 'ERROR', error }));
    }
  }, [state, api, send]);
  
  return (
    <div>
      {state === 'loading' && <Spinner />}
      {state === 'success' && <Data data={context.data} />}
      {state === 'error' && <Error error={context.error} onRetry={() => send({ type: 'RETRY' })} />}
      {state === 'idle' && <button onClick={() => send({ type: 'FETCH' })}>Load</button>}
    </div>
  );
}
```

## Provider Pattern

```jsx
// ThemeProvider.jsx
const ThemeContext = createContext();

export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setTheme] = useState(defaultTheme);
  
  const toggle = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);
  
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be in ThemeProvider');
  return context;
};
```

## Container/Presentational Pattern

```jsx
// UserListContainer.jsx - handles data
export function UserListContainer() {
  const { data, isLoading } = useQuery(['users'], fetchUsers);
  const deleteUser = useMutation(deleteUserApi);
  
  if (isLoading) return <Spinner />;
  
  return (
    <UserList 
      users={data} 
      onDelete={deleteUser.mutate}
      isDeleting={deleteUser.isLoading}
    />
  );
}

// UserList.jsx - pure UI
export function UserList({ users, onDelete, isDeleting }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
          <button onClick={() => onDelete(user.id)} disabled={isDeleting}>
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## Portals

```jsx
// Modal.jsx
import { createPortal } from 'react-dom';

export function Modal({ children, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
```

## Error Boundaries

```jsx
// ErrorBoundary.jsx
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <MyComponent />
</ErrorBoundary>
```
