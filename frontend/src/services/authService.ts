import api from './api';
import { ApiResponse, User } from '../types';

interface LoginData { email: string; password: string; }
interface RegisterData { name: string; email: string; password: string; role?: string; }
interface AuthResponseData { user: User; token: string; }

export const authService = {
  login: async (data: LoginData): Promise<ApiResponse<AuthResponseData>> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse<AuthResponseData>> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
