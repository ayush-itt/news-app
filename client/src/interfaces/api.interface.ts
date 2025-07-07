export interface IApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
}

export interface IApiError {
  message: string;
  statusCode: number;
  error?: string;
}
