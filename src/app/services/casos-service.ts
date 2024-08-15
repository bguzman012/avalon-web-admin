import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CasosService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }

    async obtenerCasos(
      page: number,
      size: number,
      busqueda: string,
      sortField: string | null = 'createdDate',
      sortOrder: number | null = -1,
      clientePolizaId: string | null = "",
    ): Promise<any> {
      try {
        const order = sortOrder === 1 ? 'asc' : 'desc';
        const sort = `&sortField=${sortField}&sortOrder=${order}`;

        console.log(order, sort)

        const casos = await this.http.get<any[]>(`${this.apiUrl}/casos?page=${page}&size=${size}&busqueda=${busqueda}${sort}&clientePolizaId=${clientePolizaId}`).toPromise();
        console.log('Resultado de casos:', casos);
        return casos;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

    async guardarCaso(casoData: any): Promise<any> {
      try {
        const response = await this.http.post<any>(`${this.apiUrl}/casos`, casoData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar caso:', error);
        throw error;
      }
    }

    async actualizarCaso(casoId: number, casoData: any): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/casos/${casoId}`, casoData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al actualizar caso:', error);
        throw error;
      }
    }

    async eliminarCaso(casoId: number): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/casos/${casoId}`, { estado: 'I' }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar caso:', error);
        throw error;
      }
    }

}
