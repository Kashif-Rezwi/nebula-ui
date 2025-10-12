import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/auth';
import { ROUTES } from '../constants';
import { storage } from '../utils';
import type { LoginCredentials, RegisterCredentials, User } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError('');
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      storage.setToken(response.accessToken);
      storage.setUser(response.user);
      
      navigate(ROUTES.CHAT);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setError('');
      setIsLoading(true);
      const response = await authApi.register(credentials);
      
      storage.setToken(response.accessToken);
      storage.setUser(response.user);
      
      navigate(ROUTES.CHAT);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    storage.clearAuth();
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const getUser = useCallback((): User | null => {
    return storage.getUser();
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!storage.getToken();
  }, []);

  return {
    login,
    register,
    logout,
    getUser,
    isAuthenticated,
    error,
    isLoading,
  };
}