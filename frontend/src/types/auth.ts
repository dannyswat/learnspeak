export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  profilePicUrl?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  name: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, string>;
}
