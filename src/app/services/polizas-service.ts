import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PolizasService {
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async obtenerPolizas(): Promise<any[]> {
    try {
      const polizas = await this.http.get<any[]>(`${this.apiUrl}/polizas`).toPromise();
      console.log('Resultado de pólizas:', polizas);
      return polizas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async obtenerPolizasByAseguradora(aseguradoraId: number): Promise<any[]> {
    try {
      const polizas = await this.http.get<any[]>(`${this.apiUrl}/aseguradoras/${aseguradoraId}/polizas`).toPromise();
      console.log('Resultado de pólizas por aseguradora:', polizas);
      return polizas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarPoliza(polizaData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/polizas`, polizaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar póliza:', error);
      throw error;
    }
  }

  async actualizarPoliza(polizaId: number, polizaData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/polizas/${polizaId}`, polizaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar póliza:', error);
      throw error;
    }
  }

  async eliminarPoliza(polizaId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/polizas/${polizaId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar póliza:', error);
      throw error;
    }
  }
}
