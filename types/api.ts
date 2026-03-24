export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum ErrorCode {
  OK               = 0,
  VALIDATION_ERROR = 1001,
  UNAUTHORIZED     = 1002,
  FORBIDDEN        = 1003,
  NOT_FOUND        = 1004,
  CONFLICT         = 1009,
  INTERNAL_ERROR   = 5000,
}
