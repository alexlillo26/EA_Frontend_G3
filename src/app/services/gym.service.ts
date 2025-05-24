import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gym } from '../models/gym.model'; // Asegúrate de que la ruta a tu modelo Gym sea correcta

@Injectable({
  providedIn: 'root',
})
export class GymService {
  
  
  private gymsApiBaseUrl = 'https://ea3-api.upc.edu/api/gym';

  constructor(private http: HttpClient) {}

  // Crear un nuevo gimnasio
  createGym(gym: Gym): Observable<Gym> {
    return this.http.post<Gym>(this.gymsApiBaseUrl, gym);
  }

  // Obtener todos los gimnasios con paginación
  getGyms(page: number, pageSize: number): Observable<{gyms: Gym[], totalGyms: number, totalPages: number, currentPage: number}> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    return this.http.get<{gyms: Gym[], totalGyms: number, totalPages: number, currentPage: number}>(this.gymsApiBaseUrl, { params });
  }

  // Obtener un gimnasio por ID
  getGymById(_id: string): Observable<Gym> {
    return this.http.get<Gym>(`${this.gymsApiBaseUrl}/${_id}`);
  }

  // Actualizar un gimnasio por ID
  updateGym(gym: Gym): Observable<Gym> {
    console.log("ID para actualizar gym:", gym._id); // Log para depuración mantenido
    return this.http.put<Gym>(`${this.gymsApiBaseUrl}/${gym._id}`, gym);
  }

  // Eliminar un gimnasio por ID
  deleteGym(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.gymsApiBaseUrl}/${_id}`);
  }

  // Ocultar o mostrar un gimnasio por ID
  hideGym(_id: string, isHidden: boolean): Observable<Gym> {
    return this.http.put<Gym>(`${this.gymsApiBaseUrl}/${_id}/oculto`, { isHidden });
  }
}