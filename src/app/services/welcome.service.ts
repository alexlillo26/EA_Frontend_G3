import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

// Recomendación para el futuro: Usar los archivos environment.ts de Angular
// para gestionar URLs de API diferentes para desarrollo y producción.
// Ejemplo: import { environment } from '../../environments/environment';
// Y luego: private apiUrlBase = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class WelcomeService {
  // AHORA: Usamos la URL del proxy del backend.
  // Tu backend, según la configuración del proxy, está en ea3-api.upc.edu
  // y tus rutas de usuario están bajo /api/users en ese backend.

  private apiUrl = 'https://ea3-api.upc.edu/api/users';


  constructor(private http: HttpClient) {}

  // Obtener el usuario actual
  getCurrentUser(): Observable<User> {
    // El endpoint específico '/current' se añade a la apiUrl base.
    // La petición irá a: https://ea3-api.upc.edu/api/users/current
    return this.http.get<User>(`${this.apiUrl}/current`); // Ajusta el endpoint '/current' si es diferente en tu backend
  }

  // Actualizar los datos del usuario
  updateUser(user: User): Observable<User> {
    const url = `${this.apiUrl}/${user._id}`;
    console.log('URL de la solicitud de actualización:', url); // Para depuración
    return this.http.put<User>(url, user);
  }
}