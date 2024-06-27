import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoberturasService {
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async obtenerCoberturasByPoliza(polizaId: number): Promise<any[]> {
    try {
      const coberturas = await this.http.get<any[]>(`${this.apiUrl}/polizas/${polizaId}/coberturas`).toPromise();
      console.log('Resultado de coberturas:', coberturas);
      return coberturas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarCobertura(coberturaData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/coberturas`, coberturaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar cobertura:', error);
      throw error;
    }
  }

  async actualizarCobertura(coberturaId: number, coberturaData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/coberturas/${coberturaId}`, coberturaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cobertura:', error);
      throw error;
    }
  }

  async eliminarCobertura(coberturaId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/coberturas/${coberturaId}`, { estado: 'I' }).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar cobertura:', error);
      throw error;
    }
  }
}
