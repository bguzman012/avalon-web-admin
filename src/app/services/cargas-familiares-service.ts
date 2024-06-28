import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargaFamiliarService {
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {}

  async createCargaFamiliar(cargaFamiliarData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/cargasFamiliares`, cargaFamiliarData).toPromise();
      return response;
    } catch (error) {
      console.error('Error creating carga familiar:', error);
      throw error;
    }
  }

  async getCargasFamiliares(): Promise<any[]> {
    try {
      const cargasFamiliares = await this.http.get<any[]>(`${this.apiUrl}/cargasFamiliares`).toPromise();
      return cargasFamiliares;
    } catch (error) {
      console.error('Error fetching cargas familiares:', error);
      throw error;
    }
  }

  async getCargasFamiliaresByClientePoliza(clientePolizaId: number): Promise<any[]> {
    try {
      const cargasFamiliares = await this.http.get<any[]>(`${this.apiUrl}/clientesPolizas/${clientePolizaId}/cargasFamiliares`).toPromise();
      return cargasFamiliares;
    } catch (error) {
      console.error('Error fetching cargas familiares by cliente poliza:', error);
      throw error;
    }
  }

  async getCargaFamiliarById(cargaFamiliarId: number): Promise<any> {
    try {
      const cargaFamiliar = await this.http.get<any>(`${this.apiUrl}/cargasFamiliares/${cargaFamiliarId}`).toPromise();
      return cargaFamiliar;
    } catch (error) {
      console.error('Error fetching carga familiar by ID:', error);
      throw error;
    }
  }

  async updateCargaFamiliar(cargaFamiliarId: number, cargaFamiliarData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/cargasFamiliares/${cargaFamiliarId}`, cargaFamiliarData).toPromise();
      return response;
    } catch (error) {
      console.error('Error updating carga familiar:', error);
      throw error;
    }
  }

  async deleteCargaFamiliar(cargaFamiliarId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/cargasFamiliares/${cargaFamiliarId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error deleting carga familiar:', error);
      throw error;
    }
  }
}
