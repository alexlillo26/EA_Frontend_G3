import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  let isRefreshing = false;
  const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  const addToken = (request: HttpRequest<any>, token: string): HttpRequest<any> => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && error.error.message === 'Token expired') {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshAccessToken().pipe(
            switchMap((newToken: string) => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken);

              const refreshToken = authService.getRefreshToken() || ''; // Provide a fallback value
              authService.setTokens(newToken, refreshToken);

              return next(addToken(req, newToken));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter((newToken) => newToken !== null),
            take(1),
            switchMap((newToken) => next(addToken(req, newToken!)))
          );
        }
      }
      return throwError(() => error);
    })
  );
};
