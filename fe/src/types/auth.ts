export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: string[];
    permissions: string[];
    avatar?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

