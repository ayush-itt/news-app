export interface ICommonResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface IErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp?: string;
}

export interface ISuccessResponse<T = any> extends ICommonResponse<T> {
  success: true;
}
