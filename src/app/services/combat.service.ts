import { Injectable } from '@angular/core';
// Asegúrate de importar HttpParams si no estaba ya
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Combat } from '../models/combat.model'; // Asegúrate de que la ruta a tu modelo Combat sea correcta

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  // AHORA: URL base apuntando al proxy del backend. Los paths como '/combat' se añadirán a esta.

  private apiUrl = 'https://ea3-api.upc.edu/api';


  constructor(private http: HttpClient) { }

  // Crear nuevo combate
  createCombat(combat: Combat): Observable<Combat> {
    const combatData = {
      gym: combat.gym, // ID del gimnasio
      date: combat.date instanceof Date ? combat.date : new Date(combat.date),
      boxers: this.processBoxers(combat.boxers) // Asegurarse de que boxers sea un array
    };
    console.log('Datos enviados al servidor para crear combate:', combatData); // Log mantenido
    return this.http.post<Combat>(`${this.apiUrl}/combat`, combatData)
      .pipe(catchError(this.handleError));
  }

  // Obtener todos los combates con paginación
  getCombats(page: number = 1, pageSize: number = 10): Observable<any> { // Considera un tipo más específico que 'any' para la respuesta
    // Construir HttpParams para la paginación de forma más segura y limpia
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/combat`, { params }) // Pasar params como objeto
      .pipe(catchError(this.handleError));
  }

  // Obtener combate por ID
  getCombatById(_id: string): Observable<Combat> {
    return this.http.get<Combat>(`${this.apiUrl}/combat/${_id}`)
      .pipe(catchError(this.handleError));
  }

  // Actualizar combate
  updateCombat(combat: Combat): Observable<Combat> {
    if (!combat._id) {
      // Considera devolver un error más específico o manejarlo de otra forma si es apropiado para tu UI
      return throwError(() => new Error('No se puede actualizar, falta el ID del combate'));
    }
    const updateData = {
      gym: combat.gym,
      date: combat.date instanceof Date ? combat.date : new Date(combat.date),
      boxers: this.processBoxers(combat.boxers)
    };
    return this.http.put<Combat>(`${this.apiUrl}/combat/${combat._id}`, updateData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar combate
  deleteCombat(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/combat/${_id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener boxeadores por ID de combate
  getBoxersByCombatId(_id: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/combat/${_id}/boxers`)
      .pipe(catchError(this.handleError));
  }

  // Ocultar combate
  hideCombat(id: string, isHidden: boolean): Observable<any> { // Considera un tipo más específico que 'any'
    return this.http.put<any>(`${this.apiUrl}/combat/${id}/oculto`, { isHidden })
      .pipe(catchError(this.handleError)); // Añadido pipe(catchError) por consistencia
  }

  // Procesar datos de boxeadores, asegurarse de que sea un array
  private processBoxers(boxers: any): string[] {
    if (typeof boxers === 'string') {
      return boxers.split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    } else if (Array.isArray(boxers)) {
      return boxers
        .map(id => typeof id === 'string' ? id.trim() : String(id).trim()) // Asegura que sea string y haz trim
        .filter(id => id.length > 0);
    }
    return [];
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    console.error('Error de API en CombatService:', error); // Es bueno saber qué servicio falló
    let errorMessage = 'Ocurrió un error desconocido en el servicio de combates.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red.
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // El backend devolvió un código de error.
      // El cuerpo de la respuesta puede contener pistas sobre qué falló.
      errorMessage = `Error del servidor: Código ${error.status}, Mensaje: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage += ` - Detalles: ${error.error.message}`;
      } else if (typeof error.error === 'string' && error.error) {
         errorMessage += ` - Detalles: ${error.error}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}