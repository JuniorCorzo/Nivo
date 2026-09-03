export interface ResponseModel<T> {
  status: string;
  data: T;
  message: string;
  timestamp: string;
}

export interface ResponseErrorModel {
  status: string;
  error: string;
  code: string;
  message: string;
  timestamp: string;
}
