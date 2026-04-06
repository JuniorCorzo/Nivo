export type ResponseModel<T> = {
  status: string;
  data: T;
  message: string;
  timestamp: string;
};

export type ResponseErrorModel = {
  status: string;
  error: string;
  code: string;
  message: string;
  timestamp: string;
};
