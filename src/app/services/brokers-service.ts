import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BrokersService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }
  
    async obtenerBrokersByEstado(estado: string): Promise<any[]> {
      try {
        const brokers = await this.http.get<any[]>(`${this.apiUrl}/brokers?estado=${estado}`).toPromise();
        console.log('Resultado de brokers:', brokers);
        return brokers;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

    async obtenerBrokersByUsuarioAndEstado(usuarioId: number, estado: string): Promise<any[]> {
      try {
        const brokers = await this.http.get<any[]>(`${this.apiUrl}/usuarios/${usuarioId}/brokers?estado=${estado}`).toPromise();
        console.log('Resultado de brokers:', brokers);
        return brokers;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }


    async guardarBroker(aseguradoraData: any): Promise<any> {
      try {
        const response = await this.http.post<any>(`${this.apiUrl}/brokers`, aseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar aseguradora:', error);
        throw error;
      }
    }
  
    async actualizarBroker(brokerId: number, aseguradoraData: any): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/brokers/${brokerId}`, aseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al actualizar aseguradora:', error);
        throw error;
      }
    }
  
    async eliminarBroker(brokerId: number): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/brokers/${brokerId}`, { estado: 'I' }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar aseguradora:', error);
        throw error;
      }
    }

}
