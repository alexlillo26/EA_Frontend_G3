import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDTO, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Eliminamos la línea [x: string]: any; a menos que la necesites específicamente para alguna funcionalidad dinámica.
  
  

  // AHORA: URL base para los endpoints de usuarios, apuntando al proxy del backend.

  private usersApiBaseUrl = 'https://ea3-api.upc.edu/api/users';


  constructor(private http: HttpClient) {}

  // Crear un nuevo usuario
  createUser(user: CreateUserDTO): Observable<User> {
    return this.http.post<User>(`${this.usersApiBaseUrl}/register`, user);
  }

  // Obtener todos los usuarios
  getUsers(page: number, pageSize: number): Observable<{users: User[], totalUsers: number, totalPages: number, currentPage: number}> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    return this.http.get<{users: User[], totalUsers: number, totalPages: number, currentPage: number}>(this.usersApiBaseUrl, { params });
  }

  // Actualizar los datos del usuario
  updateUser(user: User): Observable<User> {
    const url = `${this.usersApiBaseUrl}/${user._id}`;
    console.log('URL de la solicitud de actualización de usuario:', url); // Para depuración
    return this.http.put<User>(url, user);
  }

  // Ocultar un usuario por ID
  hideUser(_id: string, isHidden: boolean): Observable<User> {
    return this.http.put<User>(`${this.usersApiBaseUrl}/${_id}/oculto`, { isHidden });
  }

  getUserById(userId: string): Observable<User> { 
    const url = `${this.usersApiBaseUrl}/${userId}`;
    console.log('URL para la solicitud obtener usuario por ID:', url); // Para depuración
    return this.http.get<User>(url);
  }

}