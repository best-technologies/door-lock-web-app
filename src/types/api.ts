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

export interface EnrollUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender?: Gender;
  employeeId?: string;
  role: UserRole;
  department?: Department;
  accessLevel?: number;
  allowedAccessMethods: AccessMethod[];
  keypadPin?: string;
  status: UserStatus;
}

export interface EnrollUserResponse {
  success: boolean;
  message: string;
  data: UserDetails;
}

// RFID Tag DTOs
export interface AddRfidTagDto {
  tag: string;
}

export interface AddRfidTagResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    tag: string;
    userId: string;
    createdAt: string;
  };
}

// Fingerprint DTOs
export interface RegisterFingerprintDto {
  fingerprintId: number;
}

export interface RegisterFingerprintResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fingerprintId: number;
    userId: string;
    createdAt: string;
  };
}

// Keypad PIN DTOs
export interface SetKeypadPinDto {
  pin: string;
}

export interface SetKeypadPinResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    updatedAt: string;
  };
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  attendanceId: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  isWorkingDay: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  minutesLate: number | null;
  minutesEarly: number | null;
  totalHours: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string | null;
  };
}

export interface AttendanceListResponse {
  success: boolean;
  message: string;
  data: {
    data: AttendanceRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AttendanceStats {
  totalDays: number;
  workingDays: number;
  present: number;
  absent: number;
  late: number;
  earlyDeparture: number;
  halfDay: number;
  holidays: number;
  weekends: number;
  attendancePercentage: number;
  averageHoursPerDay: number;
}

export interface AttendanceStatsResponse {
  success: boolean;
  message: string;
  data: AttendanceStats;
}

export interface AttendanceHistoryFilters {
  from?: string;
  to?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface AttendanceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    data: AttendanceRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp?: {
    date?: string;
    time?: string;
  };
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HolidaysResponse {
  success: boolean;
  message: string;
  data: Holiday[];
}

export interface CreateAttendanceDto {
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface CreateHolidayDto {
  name: string;
  date: string;
  isRecurring?: boolean;
  description?: string;
}

export interface AttendanceFilters {
  userId?: string;
  from?: string;
  to?: string;
  status?: AttendanceStatus;
  department?: Department;
  page?: number;
  limit?: number;
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

