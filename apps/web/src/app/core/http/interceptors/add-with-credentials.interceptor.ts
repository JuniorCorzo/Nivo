import { HttpInterceptorFn } from '@angular/common/http';
import { ADD_WITH_CREDENTIALS } from '../context/add-with-credentials.token';

export const addWithCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(ADD_WITH_CREDENTIALS)) return next(req);
  return next(req.clone({ withCredentials: true }));
};
