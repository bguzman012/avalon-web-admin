import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CitasMedicasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }
  
  async obtenerCitasMedicas(estado: string, clientePolizaId: string): Promise<any[]> {
    try {
      const citasMedicas = await this.http.get<any[]>(`${this.apiUrl}/citasMedicas?estado=${estado}&clientePolizaId=${clientePolizaId}`).toPromise();
      console.log('Resultado de citasMedicas:', citasMedicas);
      return citasMedicas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarCitaMedica(citaMedicaData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/citasMedicas`, citaMedicaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar cita medica:', error);
      throw error;
    }
  }


    async actualizarCitaMedica(citaMedicaId: number, citaMedicaData: FormData): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`, citaMedicaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async getCitaMedica(citaMedicaId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async eliminarCitaMedica(citaMedicaId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`, { estado: 'I' }).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar cita medica:', error);
      throw error;
    }
  }
}
