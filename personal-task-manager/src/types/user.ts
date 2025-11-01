export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
  settings: TeamSettings;
}

export interface TeamMember {
  userId: string;
  user: User;
  role: TeamRole;
  joinedAt: Date;
  permissions: Permission[];
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export interface TeamSettings {
  allowMemberInvite: boolean;
  allowMemberCreateTasks: boolean;
  allowMemberEditAllTasks: boolean;
  taskVisibility: TaskVisibility;
}

export enum TaskVisibility {
  PUBLIC = 'public',    // 所有团队成员可见
  ASSIGNED = 'assigned', // 仅分配成员可见
  PRIVATE = 'private'   // 仅创建者可见
}

export enum Permission {
  VIEW_TASKS = 'view_tasks',
  CREATE_TASKS = 'create_tasks',
  EDIT_OWN_TASKS = 'edit_own_tasks',
  EDIT_ALL_TASKS = 'edit_all_tasks',
  DELETE_OWN_TASKS = 'delete_own_tasks',
  DELETE_ALL_TASKS = 'delete_all_tasks',
  ASSIGN_TASKS = 'assign_tasks',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_SETTINGS = 'manage_settings'
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}