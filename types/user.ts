export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  tags?: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  tags?: string[];
}

export interface UserDTO extends UserProfile {}
