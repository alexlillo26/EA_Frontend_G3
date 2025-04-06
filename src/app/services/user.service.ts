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

  // Actualizar un usuario por ID
  updateUser(user: User): Observable<User> {
    console.log("user", user)
    return this.http.put<User>(`${this.updateUrl}/${user._id}`, user);
  }

  // Ocultar un usuario por ID
  hideUser(_id: string, isHidden: boolean): Observable<User> {
    return this.http.put<User>(`${this.hideUrl}/${_id}/oculto`, { isHidden });
  }

}