import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientePolizaService {
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async crearClientePoliza(request: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/clientesPolizas`, request).toPromise();
      return response;
    } catch (error) {
      console.error('Error al crear ClientePoliza:', error);
      throw error;
    }
  }

  async obtenerClientesPolizas(): Promise<any[]> {
    try {
      const clientesPolizas = await this.http.get<any[]>(`${this.apiUrl}/clientesPolizas`).toPromise();
      return clientesPolizas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async obtenerClientesPolizasPorPoliza(
    polizaId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientesPolizas = await this.http.get<any[]>(`${this.apiUrl}/polizas/${polizaId}/clientesPolizas?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      return clientesPolizas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async obtenerClientesPolizasPorCliente(
    clienteId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1
    ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientesPolizas = await this.http.get<any[]>(`${this.apiUrl}/clientes/${clienteId}/clientesPolizas?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      return clientesPolizas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async obtenerClientePoliza(clientePolizaId: number): Promise<any> {
    try {
      const clientePoliza = await this.http.get<any>(`${this.apiUrl}/clientesPolizas/${clientePolizaId}`).toPromise();
      return clientePoliza;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async actualizarClientePoliza(clientePolizaId: number, request: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/clientesPolizas/${clientePolizaId}`, request).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar ClientePoliza:', error);
      throw error;
    }
  }

  async eliminarClientePoliza(clientePolizaId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/clientesPolizas/${clientePolizaId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar ClientePoliza:', error);
      throw error;
    }
  }
}
