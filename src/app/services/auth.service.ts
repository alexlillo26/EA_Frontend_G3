import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model'; 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false); 
  private apiUrl = 'http://localhost:9000/api'; 

  constructor(private http: HttpClient, private router: Router) {}

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap((response: any) => {
        console.log('Respuesta del backend:', response); // Depuración

        this.setTokens(response.token, response.refreshToken);

        // Acceder correctamente al campo isAdmin dentro del objeto user
        if (response && response.user && response.user.isAdmin === true) {
          this.loggedIn.next(true);
          this.router.navigate(['/users']); // Redirigir a la gestión de usuarios
        } else if (response && response.user && response.user.isAdmin === false) {
          this.loggedIn.next(false);
          this.router.navigate(['/welcome']); // Redirigir a la página de bienvenida
        }else {
          console.error('Estructura de la respuesta inesperada:', response);
        }
      }),
      catchError((error) => {
        console.error('Error en el login:', error);

        // Manejar el caso de usuario oculto
        if (error.error && error.error.message === 'Este usuario está oculto y no puede iniciar sesión') {
          alert('Este usuario está oculto y no puede iniciar sesión.');
        } else {
          
        }

        return throwError(() => new Error(error.error.message || 'Error al iniciar sesión.'));
      })
    );
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh-token`, { refreshToken }).pipe(
      tap((response) => {
        this.setTokens(response.token, refreshToken!);
      }),
      map((response) => response.token)
    );
  }

  googleLogin(): void {
    window.location.href = 'http://localhost:9000/api/auth/google';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}