import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetodosPagoService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {}

  async obtenerMetodosPago(): Promise<any[]> {
    try {
      const metodosPago = await this.http.get<any[]>(`${this.apiUrl}/metodosPago`).toPromise();
      console.log('Resultado de metodos Pago:', metodosPago);
      return metodosPago;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarMetodoPago(metodoPagoData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/metodosPago`, metodoPagoData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar metodoPago:', error);
      throw error;
    }
  }

  async actualizarMetodoPago(metodoPagoId: number, metodoPagoData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/metodosPago/${metodoPagoId}`, metodoPagoData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar metodoPago:', error);
      throw error;
    }
  }

  async eliminarMetodoPago(metodoPagoId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/metodosPago/${metodoPagoId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar metodoPago:', error);
      throw error;
    }
  }
}
