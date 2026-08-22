import { api, getErrorMessage } from './api';
import { storage } from '../utils/storage';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  logout: async (): Promise<void> => {
    storage.clearAuth();
  },
};
