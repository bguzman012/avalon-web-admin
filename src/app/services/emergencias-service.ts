import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, catchError, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EmergenciasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {
  }

  async obtenerEmergencias(
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

      const emergencias = await this.http.get<any[]>(`${this.apiUrl}/emergencias?estado=${estado}&clientePolizaId=${clientePolizaId}&casoId=${casoId}&page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de emergencias:', emergencias);
      return emergencias;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarEmergencia(emergenciaData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/emergencias`, emergenciaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar cita medica:', error);
      throw error;
    }
  }


  async actualizarEmergencia(emergenciaId: number, emergenciaData: FormData): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/emergencias/${emergenciaId}`, emergenciaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async getEmergencia(emergenciaId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/emergencias/${emergenciaId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async eliminarEmergencia(emergenciaId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/emergencias/${emergenciaId}`, {estado: 'I'}).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar cita medica:', error);
      throw error;
    }
  }

  async partiallyUpdateEmergencia(emergenciaId: number,
                                  partiallyUpdateObject): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/emergencias/${emergenciaId}`, partiallyUpdateObject).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar  part. cita medica:', error);
      throw error;
    }
  }
}
