import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ROUTES } from '../constants';
import { storage } from '../utils/storage';
import { toast } from '../utils/toast';
import type { User } from '../types';

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
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store auth data
      storage.setToken(data.accessToken);
      storage.setUser(data.user);

      // Update profile in query cache
      queryClient.setQueryData(authKeys.profile(), data.user);

      // Show success message
      toast.success('Welcome back!');

      // Navigate to new chat page
      navigate(ROUTES.NEW);
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
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Store auth data
      storage.setToken(data.accessToken);
      storage.setUser(data.user);

      // Update profile in query cache
      queryClient.setQueryData(authKeys.profile(), data.user);

      // Show success message
      toast.success('Account created successfully!');

      // Navigate to new chat page
      navigate(ROUTES.NEW);
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
    mutationFn: authService.logout,
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

  return useQuery<User | null>({
    queryKey: authKeys.profile(),
    queryFn: authService.getProfile,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
    initialData: () => {
      return storage.getUser();
    },
  });
}

// Hook to get current user directly without mutations
export function useUser() {
  const { data: user, isLoading } = useProfile();
  return {
    user: user ?? storage.getUser(),
    isLoading,
  };
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const token = storage.getToken();
  const { data: profile } = useProfile();

  return {
    isAuthenticated: Boolean(token && profile),
    isLoading: !token ? false : !profile,
  };
}

// Consolidated auth hook
export function useAuth() {
  const { data: user } = useProfile();
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated();

  return {
    user: user ?? storage.getUser(),
    isAuthenticated,
    isLoading: isAuthLoading,
    getUser: () => user ?? storage.getUser(),
  };
}