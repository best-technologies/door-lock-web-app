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

// Dashboard Types
export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EARLY_DEPARTURE = "early_departure",
  HALF_DAY = "half_day",
  HOLIDAY = "holiday",
  WEEKEND = "weekend",
}

export enum AccessStatus {
  SUCCESS = "success",
  FAILED = "failed",
}

export interface DashboardStats {
  totalUsers: {
    total: number;
    male: number;
    female: number;
    notSpecified: number;
  };
  totalAdmins: {
    total: number;
    active: number;
  };
  totalStaff: {
    total: number;
    staff: number;
    nysc: number;
    intern: number;
    trainee: number;
    contractor: number;
    visitor: number;
  };
  clockedInToday: {
    total: number;
    male: number;
    female: number;
    present: number;
    late: number;
    absent: number;
    halfDay: number;
    earlyDeparture: number;
  };
  userStatus: {
    active: number;
    suspended: number;
    terminated: number;
  };
  devices: {
    total: number;
    online: number;
    offline: number;
  };
}

export interface RecentUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department | null;
  status: UserStatus;
  gender: Gender | null;
  createdAt: string;
  lastAccessAt: string | null;
}

export interface TodayAttendance {
  id: string;
  date: string;
  name: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  minutesLate: number | null;
  minutesEarly: number | null;
  totalHours: number | null;
  isWorkingDay: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  user: {
    userId: string;
    email: string;
    role: UserRole;
    department: Department | null;
    gender: Gender | null;
  };
}

export interface RecentAccessLog {
  logId: string;
  timestamp: string;
  method: AccessMethod;
  status: AccessStatus;
  user: {
    userId: string;
    name: string;
    email: string;
  };
  device: {
    deviceId: string;
    name: string;
    location: string;
  };
}

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  devicesOnline: number;
  devicesOffline: number;
  accessAttemptsToday: number;
  successfulAttempts: number;
  failedAttempts: number;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  recentUsers: RecentUser[];
  todayAttendance: TodayAttendance[];
  departmentBreakdown: Record<string, number>;
  recentAccessLogs: RecentAccessLog[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
}

// Users Management Types
export interface UserDetails extends User {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastAccessAt?: string | null;
  profilePicture?: {
    secureUrl: string;
    publicId: string;
  } | null;
  rfidTags?: string[];
  fingerprintIds?: number[];
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: UserDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface UpdateUserRoleResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    department?: Department | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  department?: Department;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  employeeId?: string;
  status?: UserStatus;
  role?: UserRole;
  department?: Department;
  accessLevel?: number;
  allowedAccessMethods?: AccessMethod[];
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: UserDetails;
}

