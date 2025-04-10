import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDTO, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  [x: string]: any;
  private registerUrl = 'http://localhost:9000/api/users/register';
  private listUrl = 'http://localhost:9000/api/users';
  private updateUrl = 'http://localhost:9000/api/users';
  private hideUrl = 'http://localhost:9000/api/users';

  constructor(private http: HttpClient) {}

  // Crear un nuevo usuario
  createUser(user: CreateUserDTO): Observable<User> {
    return this.http.post<User>(this.registerUrl, user);
  }

  // Obtener todos los usuarios
  getUsers(page: number, pageSize: number): Observable<{users: User[], totalUsers: number, totalPages: number, currentPage: number}> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    return this.http.get<{users: User[], totalUsers: number, totalPages: number, currentPage: number}>(this.listUrl, { params });
  }

      updateUser(user: User): Observable<User> {
      const url = `${this.updateUrl}/${user._id}`; // Usa la propiedad updateUrl para construir la URL
      console.log('URL de la solicitud:', url); // Para depuración
      return this.http.put<User>(url, user);
    }

  // Ocultar un usuario por ID
  hideUser(_id: string, isHidden: boolean): Observable<User> {
    return this.http.put<User>(`${this.hideUrl}/${_id}/oculto`, { isHidden });
  }


  getCurrentUser(userId: string): Observable<User> {
  const url = `${this.listUrl}/`+userId; // Endpoint para obtener el usuario logueado
  console.log('URL de la  parasolicitud obtener el usuario actual:', url); // Para depuración
  return this.http.get<User>(url);
  }

}