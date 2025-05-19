import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDTO, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Eliminamos la línea [x: string]: any; a menos que la necesites específicamente para alguna funcionalidad dinámica.
  
  // ANTES: Múltiples URLs con localhost
  // private registerUrl = 'http://localhost:9000/api/users/register';
  // private listUrl = 'http://localhost:9000/api/users';
  // private updateUrl = 'http://localhost:9000/api/users';
  // private hideUrl = 'http://localhost:9000/api/users';

  // AHORA: URL base para los endpoints de usuarios, apuntando al proxy del backend.
  private usersApiBaseUrl = 'http://ea3-api.upc.edu/api/users';

  constructor(private http: HttpClient) {}

  // Crear un nuevo usuario
  createUser(user: CreateUserDTO): Observable<User> {
    // La petición irá a: http://ea3-api.upc.edu/api/users/register
    return this.http.post<User>(`${this.usersApiBaseUrl}/register`, user);
  }

  // Obtener todos los usuarios
  getUsers(page: number, pageSize: number): Observable<{users: User[], totalUsers: number, totalPages: number, currentPage: number}> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    // La petición irá a: http://ea3-api.upc.edu/api/users?page=...&pageSize=...
    return this.http.get<{users: User[], totalUsers: number, totalPages: number, currentPage: number}>(this.usersApiBaseUrl, { params });
  }

  // Actualizar los datos del usuario
  updateUser(user: User): Observable<User> {
    // La petición irá a: http://ea3-api.upc.edu/api/users/<user._id>
    const url = `${this.usersApiBaseUrl}/${user._id}`;
    console.log('URL de la solicitud de actualización de usuario:', url); // Para depuración
    return this.http.put<User>(url, user);
  }

  // Ocultar un usuario por ID
  hideUser(_id: string, isHidden: boolean): Observable<User> {
    // La petición irá a: http://ea3-api.upc.edu/api/users/<_id>/oculto
    return this.http.put<User>(`${this.usersApiBaseUrl}/${_id}/oculto`, { isHidden });
  }

  // Obtener un usuario específico por su ID (antes llamado getCurrentUser pero parecía más genérico)
  // Si es específicamente para el usuario logueado, y el backend tiene una ruta como /api/users/me o /api/users/current,
  // podrías crear un método separado para eso sin pasar el userId.
  getUserById(userId: string): Observable<User> { 
    // La petición irá a: http://ea3-api.upc.edu/api/users/<userId>
    const url = `${this.usersApiBaseUrl}/${userId}`;
    console.log('URL para la solicitud obtener usuario por ID:', url); // Para depuración
    return this.http.get<User>(url);
  }

  // Si tienes un método específico en el backend para el usuario actual (logueado),
  // que no requiere pasar el ID en la URL (porque el backend lo toma del token),
  // podría ser algo así:
  // getCurrentAuthenticatedUser(): Observable<User> {
  //   // Ejemplo: Petición a http://ea3-api.upc.edu/api/users/current (o /me)
  //   return this.http.get<User>(`${this.usersApiBaseUrl}/current`); 
  // }
}