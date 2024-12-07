import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: User | null;
}

interface User {
  email: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // TODO: Fetch user details
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication
      if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
        const mockUser = {
          email: TEST_CREDENTIALS.email,
          name: 'Test User',
        };
        localStorage.setItem('authToken', 'mock-jwt-token');
        setIsAuthenticated(true);
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 