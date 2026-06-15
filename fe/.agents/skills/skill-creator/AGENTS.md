# AGENTS.md - Laundry Locker Frontend

File này chứa thông tin quan trọng dành cho AI coding agents làm việc với dự án Laundry Locker Frontend.

---

## Project Overview

**Tên dự án:** Laundry Locker Frontend (fe)  
**Mô tả:** Frontend cho hệ thống tủ giặt thông minh (Smart Laundry Lockers)  
**Ngôn ngữ chính:** TypeScript, Vietnamese (comments và documentation)

Dự án là một Single Page Application (SPA) cung cấp giao diện quản lý cho 2 loại người dùng chính:
- **Admin**: Quản lý toàn hệ thống (users, stores, lockers, orders, payments, etc.)
- **Partner**: Chủ cửa hàng/quản lý đối tác (dashboard, orders, staff, revenue)

---

## Technology Stack

### Core Technologies
| Tech | Version | Purpose |
|------|---------|---------|
| React | ^19.2.0 | UI Library |
| TypeScript | ~5.9.3 | Type-safe JavaScript |
| Vite | ^7.2.4 | Build tool & dev server |
| React Router DOM | ^7.12.0 | Client-side routing |

### Styling
| Tech | Version | Purpose |
|------|---------|---------|
| Tailwind CSS | ^4.1.18 | Utility-first CSS |
| tailwindcss-animate | ^1.0.7 | Animation utilities |
| class-variance-authority | ^0.7.1 | Component variants |
| clsx | ^2.1.1 | Conditional class merging |
| tailwind-merge | ^3.4.0 | Tailwind class deduplication |

### UI Components
| Tech | Version | Purpose |
|------|---------|---------|
| Radix UI | various | Headless UI primitives |
| shadcn/ui | - | Component collection |
| Ant Design | ^6.2.1 | Enterprise UI library |
| @ant-design/icons | ^6.1.0 | Icon library |
| lucide-react | ^0.562.0 | Icon library |

### State Management & Data Fetching
| Tech | Version | Purpose |
|------|---------|---------|
| Redux Toolkit | ^2.11.2 | Global state management |
| RTK Query | built-in | Data fetching & caching |
| React Hook Form | ^7.71.1 | Form management |
| @hookform/resolvers | ^5.2.2 | Form validation |
| Zod | ^4.3.6 | Schema validation |

### Internationalization
| Tech | Version | Purpose |
|------|---------|---------|
| i18next | ^25.8.0 | i18n framework |
| react-i18next | ^16.5.3 | React integration |

### Other Libraries
- **dayjs**: Date manipulation
- **recharts**: Charts and data visualization
- **embla-carousel-react**: Carousels
- **next-themes**: Theme management
- **sonner**: Toast notifications
- **vaul**: Drawer component
- **cmdk**: Command palette
- **input-otp**: OTP input

---

## Project Structure

```
fe/
├── public/                    # Static assets (served directly)
├── messages/                  # i18n translation files
│   ├── en.json               # English translations
│   ├── vi.json               # Vietnamese translations
│   └── ja.json               # Japanese translations
├── src/
│   ├── assets/               # Static assets (imported)
│   │   ├── images/
│   │   └── backgrounds/
│   ├── components/
│   │   ├── ui/               # Shadcn/Radix UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (50+ components)
│   │   ├── admin/            # Admin-specific components
│   │   └── shared/           # Shared components
│   ├── constants/            # Constants & config
│   │   ├── api-paths.ts      # API endpoint definitions
│   │   ├── api.constants.ts
│   │   ├── sidebar.ts        # Sidebar navigation config
│   │   └── ...
│   ├── context/              # React Context providers
│   │   └── auth-context.tsx  # Authentication context
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── utils.ts          # cn() utility for Tailwind
│   │   ├── i18n.tsx          # i18n provider & utilities
│   │   └── validation.ts     # Zod validation helpers
│   ├── mockdata/             # Mock data for development
│   ├── pages/                # Page components
│   │   ├── auth/             # Auth pages (login)
│   │   ├── Admin/            # Admin dashboard pages
│   │   ├── Partner/          # Partner dashboard pages
│   │   └── Error/            # Error pages (404, 403, etc.)
│   ├── routes/               # Routing configuration
│   │   ├── app-router.tsx    # Main router component
│   │   ├── routes-config.tsx # Route definitions
│   │   └── protected-route.tsx # Auth guards
│   ├── schemas/              # Zod validation schemas
│   │   ├── admin.schemas.ts
│   │   ├── partner.schemas.ts
│   │   └── common.schemas.ts
│   ├── stores/               # Redux store & APIs
│   │   ├── store.ts          # Redux store configuration
│   │   ├── baseAPi.ts        # RTK Query base API
│   │   └── apis/             # API slices
│   │       ├── admin/        # Admin APIs
│   │       └── partner/      # Partner APIs
│   ├── types/                # TypeScript types
│   │   ├── admin/            # Admin-related types
│   │   ├── partner/          # Partner-related types
│   │   ├── common/           # Common types
│   │   └── components/       # Component prop types
│   ├── utils/                # Utility functions
│   │   └── i18n.ts           # i18next initialization
│   ├── App.tsx               # Root component
│   ├── App.css               # App styles
│   ├── index.css             # Global styles + Tailwind
│   └── main.tsx              # Entry point
├── .env                      # Environment variables
├── components.json           # Shadcn/ui configuration
├── tailwind.config.js        # Tailwind CSS v3 config
├── postcss.config.js         # PostCSS configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.app.json         # TypeScript app config
├── tsconfig.node.json        # TypeScript node config
├── eslint.config.js          # ESLint configuration
└── vercel.json               # Vercel deployment config
```

---

## Build & Development Commands

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Install dependencies
npm install
```

### Port Configuration
- Dev server runs on port **3000** (strict mode - will fail if port is taken)
- Backend API runs on port **8080** (configurable via `.env`)

---

## Environment Variables

File `.env` chứa các biến môi trường:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# Development Settings
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_LOGS=false
```

**Lưu ý:** Tất cả biến môi trường phải có prefix `VITE_` để được expose ra client.

---

## Code Style Guidelines

### Path Aliases
Dự án sử dụng 2 path aliases (trong `tsconfig.app.json` và `vite.config.ts`):
- `~/` → `./src/`
- `@/` → `./src/`

**Khuyến nghị:** Sử dụng `~/` cho consistency với Shadcn/ui components.

### Component Structure Pattern (Shadcn/ui style)
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", destructive: "..." },
      size: { default: "...", sm: "..." },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase với prefix `use` (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE hoặc camelCase (e.g., `API_ENDPOINTS`)
- **Types/Interfaces**: PascalCase với suffix (e.g., `UserProps`, `OrderData`)
- **Files**: kebab-case cho utilities, PascalCase cho components

### Tailwind Class Ordering
1. Layout (display, position, width, height)
2. Spacing (margin, padding)
3. Typography (font, text)
4. Visual (background, border, color)
5. Interactive (hover, focus, disabled)

---

## State Management Architecture

### Redux Store (`src/stores/store.ts`)
```typescript
// Single store với RTK Query
store = {
  [baseApi.reducerPath]: baseApi.reducer  // API cache
}
```

### RTK Query Base API (`src/stores/baseAPi.ts`)
- Base URL: `VITE_API_BASE_URL`
- Authentication: Bearer token từ localStorage
- Tag Types: Cache invalidation cho các entity (User, Store, Order, etc.)

### API Organization
```
src/stores/apis/
├── admin/              # Admin APIs
│   ├── index.ts
│   ├── users.ts
│   ├── stores.ts
│   ├── lockers.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── loyalty.ts
│   ├── partners.ts
│   └── ...
├── partner/            # Partner APIs
│   ├── index.ts
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── orders.ts
│   └── ...
├── authApi.ts          # Common auth APIs
├── adminAuthApi.ts     # Admin auth APIs
└── adminApi.ts         # Combined admin exports
```

---

## Authentication Flow

### Admin Authentication (2FA)
1. `adminLoginStep1(email, password)` → Nhận tempToken
2. `adminLoginStep2(otpCode)` → Xác thực 2FA, nhận accessToken
3. Token được lưu trong localStorage

### Partner Authentication (OTP)
1. `partnerSendOTP(contact, type)` → Gửi OTP qua Email/Phone
2. `partnerVerifyOTP(otpCode)` → Xác thực và đăng nhập
3. Token được lưu trong localStorage

### Protected Routes (`src/routes/protected-route.tsx`)
- Kiểm tra authentication
- Kiểm tra role (ADMIN/PARTNER)
- Kiểm tra specific permission (nếu có)

---

## Internationalization (i18n)

### Custom i18n Implementation (`src/lib/i18n.tsx`)

**Supported locales:** `en`, `vi`, `ja`

**Locale detection priority:**
1. URL path (e.g., `/en/admin/dashboard`)
2. localStorage (`locale` key)
3. Browser language
4. Fallback: `en`

**Usage trong React:**
```typescript
import { useI18n } from "@/lib/i18n";

const { t, locale, setLocale } = useI18n();
// t("admin.orders.title") → "Orders"
```

**Usage ngoài React:**
```typescript
import { t, withLocale } from "@/lib/i18n";
// withLocale("/admin/dashboard") → "/en/admin/dashboard"
```

**Translation files:** `messages/{en,vi,ja}.json`

---

## Routing Structure

```
/:locale                    # Locale prefix required
├── /auth
│   ├── /login              # Login page
│   └── /register           # Register page (placeholder)
├── /admin                  # Protected: ADMIN role
│   ├── /dashboard
│   ├── /users
│   ├── /stores
│   ├── /lockers
│   ├── /services
│   ├── /orders
│   ├── /payments
│   ├── /loyalty
│   ├── /partners
│   └── /feedback
├── /partner                # Protected: PARTNER role
│   ├── /dashboard
│   ├── /orders
│   ├── /staff
│   ├── /revenue
│   ├── /lockers
│   ├── /services
│   ├── /notifications
│   ├── /settings
│   └── /profile
└── /*                      # Error pages (404, 403, 503)
```

**Lazy Loading:** Tất cả page components được lazy loaded với Suspense fallback.

---

## Validation Strategy

### Zod Schemas (`src/schemas/`)
- `admin.schemas.ts`: Admin request validation
- `partner.schemas.ts`: Partner request validation  
- `common.schemas.ts`: Shared schemas (pagination, etc.)

### Validation Helper (`src/lib/validation.ts`)
```typescript
import { validateWithZod, createValidator } from "@/lib/validation";

const result = validateWithZod(CreateUserRequestSchema, data);
// Returns: { success: true, data: T } | { success: false, errors: ZodError }
```

---

## Testing Strategy

Hiện tại dự án **không có test framework** được cài đặt. Nếu cần thêm tests, xem xét:
- **Vitest** (phù hợp với Vite ecosystem)
- **React Testing Library** cho component tests
- **Playwright/Cypress** cho E2E tests

---

## Deployment

### Vercel Configuration (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Đây là SPA routing configuration - tất cả routes đều được redirect về `index.html`.

### Build Output
- Output directory: `dist/` (Vite default)
- Static files: Copy từ `public/`
- Assets: Hashed filenames cho caching

---

## API Documentation

Dự án có 2 file API documentation chính:
- `api.md`: Admin API documentation
- `partner.md`: Partner API documentation

### Response Format Standard
```typescript
{
  success: boolean,
  message: string,
  data: T | null,
  errors?: Array<{ field: string, message: string }>
}
```

---

## Common Tasks

### Thêm mới UI Component (Shadcn style)
1. Tạo file trong `src/components/ui/`
2. Sử dụng pattern: Radix UI primitive + cva + cn()
3. Export trong `src/components/ui/index.tsx` nếu cần

### Thêm mới API Endpoint
1. Define endpoint trong `src/constants/api-paths.ts`
2. Tạo RTK Query endpoint trong `src/stores/apis/admin/` hoặc `src/stores/apis/partner/`
3. Export trong `src/stores/apis/admin/index.ts` hoặc `src/stores/apis/partner/index.ts`
4. Add tag type trong `src/stores/baseAPi.ts` nếu cần cache invalidation

### Thêm mới Page
1. Tạo component trong `src/pages/{Admin,Partner}/`
2. Lazy import trong `src/routes/routes-config.tsx`
3. Add route configuration với Suspense wrapper

### Thêm mới Translation
1. Thêm key vào cả 3 files: `messages/en.json`, `messages/vi.json`, `messages/ja.json`
2. Sử dụng `t("key.nested")` trong component

---

## Important Notes

1. **Strict TypeScript**: `strict: false` trong tsconfig - cho phép implicit any
2. **Vite Port**: Dev server dùng port 3000, strict port enabled
3. **Mock Data**: `VITE_ENABLE_MOCK_DATA=true` để dùng mock data
4. **Token Storage**: JWT tokens lưu trong localStorage (key: `accessToken`, `refreshToken`)
5. **Theme**: Sử dụng CSS variables cho theming (light/dark mode)
6. **Primary Color**: Blue-900 (`#1e3a8a`)
7. **Secondary Color**: Orange-200 (`#fdba74`)

---

## Troubleshooting

### Port 3000 bị chiếm
Vite sử dụng `strictPort: true`, nên sẽ fail nếu port 3000 bị chiếm. Tùy chọn:
1. Kill process đang dùng port 3000
2. Hoặc sửa `vite.config.ts` đổi sang port khác

### Translation không cập nhật
- Kiểm tra URL có locale prefix (e.g., `/en/`)
- Kiểm tra `localStorage.locale`
- Hard refresh browser

### API calls fail
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Backend server phải chạy trên port 8080 (mặc định)
- Kiểm tra CORS configuration trên backend

---

## File Dependencies

### Entry Point Chain
```
index.html → src/main.tsx → src/App.tsx → src/routes/app-router.tsx
                                        ↓
                           src/routes/routes-config.tsx (lazy loaded pages)
```

### Global Providers (trong `main.tsx`)
1. `Provider` (Redux)
2. `BrowserRouter` (React Router)
3. `AuthProvider` (Auth Context)
4. `I18nProvider` (i18n Context)

---

*Last updated: 2026-02-23*
