import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/auth';
import { ROUTES } from '../constants';
import { storage } from '../utils';
import { toast } from '../utils/toast';
import type { LoginCredentials, RegisterCredentials, User } from '../types';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Hook for login mutation
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store auth data
      storage.setToken(data.accessToken);
      storage.setUser(data.user);
      
      // Update profile in query cache
      queryClient.setQueryData(authKeys.profile(), data.user);
      
      // Show success message
      toast.success('Welcome back!');
      
      // Navigate to chat
      navigate(ROUTES.CHAT);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });
}

// Hook for register mutation
export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store auth data
      storage.setToken(data.accessToken);
      storage.setUser(data.user);
      
      // Update profile in query cache
      queryClient.setQueryData(authKeys.profile(), data.user);
      
      // Show success message
      toast.success('Account created successfully!');
      
      // Navigate to chat
      navigate(ROUTES.CHAT);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });
}

// Hook for logout
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all auth-related data
      storage.clearAuth();
      
      // Clear all queries
      queryClient.clear();
      
      // Show info message
      toast.info('Logged out successfully');
      
      // Navigate to login
      navigate(ROUTES.LOGIN);
    },
  });
}

// Hook to get current user profile
export function useProfile() {
  const token = storage.getToken();
  
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: !!token,
    staleTime: 1000 * 60 * 30, // Consider profile data fresh for 30 minutes
    retry: false, // Don't retry on 401
    initialData: () => {
      // Use cached user data as initial data if available
      const cachedUser = storage.getUser();
      return cachedUser || undefined;
    },
  });
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const token = storage.getToken();
  const { data: profile } = useProfile();
  
  return {
    isAuthenticated: !!token && !!profile,
    isLoading: !token ? false : !profile,
  };
}

// Consolidated auth hook for backward compatibility
export function useAuth() {
  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: logout } = useLogout();
  const { data: user } = useProfile();
  const { isAuthenticated } = useIsAuthenticated();

  return {
    // Actions
    login: (credentials: LoginCredentials) => login(credentials),
    register: (credentials: RegisterCredentials) => register(credentials),
    logout: () => logout(),
    
    // State
    user,
    isAuthenticated,
    isLoading: isLoggingIn || isRegistering,
    
    // Utility functions (for backward compatibility)
    getUser: () => user || storage.getUser(),
  };
}