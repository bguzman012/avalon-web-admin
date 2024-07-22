import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, catchError, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CasosService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {
  }

  async obtenerCasos(
    estado: string,
    clientePolizaId: string,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1
  ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const casos = await this.http.get<any[]>(`${this.apiUrl}/casos?estado=${estado}&clientePolizaId=${clientePolizaId}&page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de casos:', casos);
      return casos;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarCaso(casoData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/casos`, casoData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar cita medica:', error);
      throw error;
    }
  }


  async actualizarCaso(casoId: number, casoData: FormData): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/casos/${casoId}`, casoData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async getCaso(casoId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/casos/${casoId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async eliminarCaso(casoId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/casos/${casoId}`, {estado: 'I'}).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar cita medica:', error);
      throw error;
    }
  }

  async partiallyUpdateCaso(casoId: number, estado: string): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/casos/${casoId}`, {estado: estado}).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar  part. cita medica:', error);
      throw error;
    }
  }
}
