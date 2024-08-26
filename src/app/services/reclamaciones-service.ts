import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ReclamacionesService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async obtenerReclamaciones(
    estado: string,
    clientePolizaId: string,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1,
    casoId: string | null = ""
  ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const reclamaciones = await this.http.get<any[]>(`${this.apiUrl}/reclamaciones?estado=${estado}&clientePolizaId=${clientePolizaId}&casoId=${casoId}&page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de reclamaciones:', reclamaciones);
      return reclamaciones;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarReclamacion(reclamacionData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/reclamaciones`, reclamacionData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar reclamación:', error);
      throw error;
    }
  }


    async actualizarReclamacion(reclamacionId: number, reclamacionData: FormData): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/reclamaciones/${reclamacionId}`, reclamacionData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar reclamación:', error);
      throw error;
    }
  }

  async getReclamacion(reclamacionId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/reclamaciones/${reclamacionId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar reclamación:', error);
      throw error;
    }
  }

  async eliminarReclamacion(reclamacionId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/reclamaciones/${reclamacionId}`, { estado: 'I' }).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar reclamación:', error);
      throw error;
    }
  }

  async partiallyUpdateReclamacion(reclamacionId: number,
                                   partiallyUpdateObject): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/reclamaciones/${reclamacionId}`, partiallyUpdateObject).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar  part. reclamo:', error);
      throw error;
    }
  }
}
