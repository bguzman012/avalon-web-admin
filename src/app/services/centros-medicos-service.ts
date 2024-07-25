import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CentrosMedicosService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }

    async obtenerCentrosMedicos(
      page: number,
      size: number,
      busqueda: string,
      sortField: string | null = 'createdDate',
      sortOrder: number | null = -1
    ): Promise<any> {
      try {
        const order = sortOrder === 1 ? 'asc' : 'desc';
        const sort = `&sortField=${sortField}&sortOrder=${order}`;

        const centrosMedicos = await this.http.get<any[]>(`${this.apiUrl}/centrosMedicos?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
        console.log('Resultado de centrosMedicos:', centrosMedicos);
        return centrosMedicos;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

    async guardarCentroMedico(aseguradoraData: any): Promise<any> {
      try {
        const response = await this.http.post<any>(`${this.apiUrl}/centrosMedicos`, aseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar aseguradora:', error);
        throw error;
      }
    }

    async actualizarCentroMedico(aseguradoraId: number, aseguradoraData: any): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/centrosMedicos/${aseguradoraId}`, aseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al actualizar aseguradora:', error);
        throw error;
      }
    }

    async eliminarCentroMedico(aseguradoraId: number): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/centrosMedicos/${aseguradoraId}`, { estado: 'I' }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar aseguradora:', error);
        throw error;
      }
    }

}
