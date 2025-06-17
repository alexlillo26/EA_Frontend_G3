import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // HttpErrorResponse importada pero no usada explícitamente en el handleError original, pero es buena práctica tenerla.
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model'; // Asegúrate que la ruta al modelo User sea correcta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inicializar el estado loggedIn basado en si ya existe un token
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken()); 
  
  // ANTES: private apiUrl = 'http://localhost:9000/api';
  // AHORA: URL base apuntando al proxy del backend.
  private apiUrl = 'http://localhost:9000/api'; 
  // URL base específica para el flujo de Google OAuth para mayor claridad
  private googleAuthBaseUrl = 'http://localhost:9000/api/auth/google';

  constructor(private http: HttpClient, private router: Router) {}

  // Método privado para verificar si ya existe un token al iniciar el servicio
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  get isLoggedIn(): Observable<boolean> { // Tipado explícito del retorno
    return this.loggedIn.asObservable();
  }

  updateLoggedInState(state: boolean): void {
    this.loggedIn.next(state);
  }

  setTokens(token: string, refreshToken?: string): void { // refreshToken ahora es opcional
    localStorage.setItem('token', token);
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
    // No es necesario remover el refreshToken si no viene, a menos que esa sea la lógica deseada.
    this.updateLoggedInState(true); 
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  login(credentials: { email: string; password: string }): Observable<User> { // Asumimos que la respuesta directa o una parte es User
    // Petición a: http://ea3-api.upc.edu/api/users/login
    return this.http.post<any>(`${this.apiUrl}/users/login`, credentials).pipe( // Usamos <any> para manejar la estructura de respuesta flexible
      tap((response: any) => {
        console.log('Respuesta del backend en login:', response); 

        if (response && response.token) {
          this.setTokens(response.token, response.refreshToken);

          if (response.user && typeof response.user.isAdmin === 'boolean') {
            // this.loggedIn.next(true); // setTokens ya llama a updateLoggedInState
            if (response.user.isAdmin === true) {
              this.router.navigate(['/users']); 
            } else {
              this.router.navigate(['/welcome']); 
            }
          } else {
            console.error('Estructura de respuesta de usuario inesperada o falta isAdmin en login:', response.user);
            this.router.navigate(['/welcome']); // Redirección por defecto si no está claro el rol
          }
        } else {
          console.error('Token no encontrado en la respuesta del login:', response);
          // Considera lanzar un error aquí si la ausencia de token es un fallo de login
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en el login:', error);
        let displayMessage = 'Error al iniciar sesión.';
        // Intenta usar el mensaje de error del backend si está disponible
        if (error.error && typeof error.error === 'object' && error.error.message) {
          displayMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          displayMessage = error.error;
        } else if (error.message) {
          displayMessage = error.message; // Fallback al mensaje de HttpErrorResponse
        }
        
        if (displayMessage === 'Este usuario está oculto y no puede iniciar sesión') {
          alert(displayMessage); // Alerta específica
        }
        // this.updateLoggedInState(false); // Asegura que el estado sea 'no logueado' en caso de error
        return throwError(() => new Error(displayMessage));
      })
    );
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
        console.error('❌ Refresh token is missing.'); // Log missing refresh token
        return throwError(() => new Error('Refresh token is missing.'));
    }
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh-token`, { refreshToken }).pipe(
        tap((response) => {
            console.log('✅ Refresh token response:', response); // Log the response
            this.setTokens(response.token, refreshToken); // Update token, keep refreshToken
        }),
        map((response) => response.token),
        catchError((error) => {
            console.error('❌ Error refreshing token:', error); // Log refresh error
            return throwError(() => error);
        })
    );
  }

  googleLogin(): void {
    // La redirección ahora usa la URL base del proxy para Google Auth.
    // El parámetro 'origin' es importante para que tu backend sepa a dónde redirigir al usuario después de la autenticación de Google.
    // Usar window.location.origin asegura que redirija al frontend correcto (ea3.upc.edu o ea3-back.upc.edu).
    const currentFrontendOrigin = window.location.origin; 
    window.location.href = `${this.googleAuthBaseUrl}?origin=${encodeURIComponent(currentFrontendOrigin)}`;
  }

  // Este método podría ser redundante si tu backend maneja el registro/login con Google en un solo flujo desde /api/auth/google
  googleRegister(): Observable<any> {
    // Petición a: http://ea3-api.upc.edu/api/auth/google
    return this.http.get<any>(this.googleAuthBaseUrl).pipe(
      tap((response) => {
        console.log('Datos obtenidos de Google (en googleRegister):', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en Google Register:', error);
        return throwError(() => new Error('Error en Google Register'));
      })
    );
  }

  completeGoogleRegister(password: string): Observable<any> {
    const code = new URLSearchParams(window.location.search).get('code');
    // Petición a: http://ea3-api.upc.edu/api/auth/google/register
    return this.http.post<any>(`${this.googleAuthBaseUrl}/register`, { code, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setTokens(response.token, response.refreshToken);
        } else {
          console.error('Token no encontrado al completar registro con Google:', response);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al completar registro con Google:', error);
        return throwError(() => new Error('Error al completar registro con Google'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.loggedIn.next(false); // Actualizar el BehaviorSubject
    this.router.navigate(['/login']);
  }
}