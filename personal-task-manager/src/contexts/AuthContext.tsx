import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AuthState, User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/mockApi';

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 检查本地存储的token
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      // 简化的token验证（实际应用中应该验证token的有效性）
      const userId = token.split('-')[2];
      if (userId) {
        // 这里应该调用API验证token并获取用户信息
        // 为了演示，我们直接认为token有效
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: {
              id: userId,
              username: 'demo',
              email: 'demo@example.com',
              displayName: 'Demo User',
              role: 'member' as any,
              status: 'active' as any,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            token
          }
        });
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const authState = await authService.login(credentials);
      localStorage.setItem('auth-token', authState.token!);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: authState.user!,
          token: authState.token!
        }
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : '登录失败'
      });
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const authState = await authService.register(data);
      localStorage.setItem('auth-token', authState.token!);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: authState.user!,
          token: authState.token!
        }
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : '注册失败'
      });
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('auth-token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};