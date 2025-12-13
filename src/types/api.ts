// Enums from Identity API
export enum UserRole {
  STAFF = "staff",
  INTERN = "intern",
  NYSC = "nysc",
  TRAINEE = "trainee",
  ADMIN = "admin",
  CONTRACTOR = "contractor",
  VISITOR = "visitor",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
}

export enum Department {
  ENGINEERING = "Engineering",
  HR = "HR",
  FINANCE = "Finance",
  OPERATIONS = "Operations",
  IT = "IT",
  SALES = "Sales",
  MARKETING = "Marketing",
  ADMINISTRATION = "Administration",
  SECURITY = "Security",
  MAINTENANCE = "Maintenance",
}

export enum Gender {
  M = "M",
  F = "F",
}

export enum AccessMethod {
  RFID = "rfid",
  FINGERPRINT = "fingerprint",
  KEYPAD = "keypad",
}

// User types
export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  phoneNumber?: string;
  gender?: Gender;
  employeeId?: string;
  department?: Department;
  accessLevel?: number;
  allowedAccessMethods?: AccessMethod[];
}

// Auth response
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T[];
  total?: number;
  errors?: string[];
}

// Request DTOs
export interface SignInDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender?: Gender;
  role: UserRole;
  department?: Department;
  accessLevel?: number;
  allowedAccessMethods: AccessMethod[];
  keypadPin?: string;
  status: UserStatus;
  // Note: password is auto-generated and sent via email
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

