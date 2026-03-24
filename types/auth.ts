import { UserProfile } from './user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  permissions: string[];
}
