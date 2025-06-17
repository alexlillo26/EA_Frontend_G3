import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const addToken = (request: HttpRequest<any>, token: string): HttpRequest<any> => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true // Enable credentials for each request
    });
  };

  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401 && !authReq.headers.has('_retry')) {
        console.warn('⚠️ Token expirado. Intentando refresh...');

        return authService.refreshAccessToken().pipe(
          switchMap((newToken: string) => {
            console.log('✅ Nuevo token:', newToken);

            const retryReq = addToken(authReq, newToken).clone({
              setHeaders: {
                ...authReq.headers.keys().reduce((headers, key) => {
                  headers[key] = authReq.headers.get(key)!;
                  return headers;
                }, {} as Record<string, string>),
                Authorization: `Bearer ${newToken}`,
                _retry: 'true'
              }
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            console.error('❌ Falló el refresh token:', refreshError);
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
