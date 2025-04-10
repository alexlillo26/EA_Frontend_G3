import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class WelcomeService {
  private apiUrl = 'http://localhost:9000/api/users'; // Cambia esta URL según tu backend

  constructor(private http: HttpClient) {}

  // Obtener el usuario actual
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/current`); // Ajusta el endpoint según tu backend
  }

  // Actualizar los datos del usuario
  updateUser(user: User): Observable<User> {
    const url = `${this.apiUrl}/${user._id}`; // Construir la URL con el ID del usuario
    console.log('URL de la solicitud:', url); // Para depuración
    return this.http.put<User>(url, user);
  }
}