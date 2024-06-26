import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AseguradorasService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }
  
    async obtenerAseguradorasByEstado(estado: string): Promise<any[]> {
      try {
        const aseguradoras = await this.http.get<any[]>(`${this.apiUrl}/aseguradoras?estado=${estado}`).toPromise();
        console.log('Resultado de aseguradoras:', aseguradoras);
        return aseguradoras;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

    async obtenerAseguradorasByUsuarioAndEstado(usuarioId: number, estado: string): Promise<any[]> {
      try {
        const aseguradoras = await this.http.get<any[]>(`${this.apiUrl}/usuarios/${usuarioId}/aseguradoras?estado=${estado}`).toPromise();
        console.log('Resultado de aseguradoras:', aseguradoras);
        return aseguradoras;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }


    async guardarAseguradora(aseguradoraData: any): Promise<any> {
      try {
        const response = await this.http.post<any>(`${this.apiUrl}/aseguradoras`, aseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar aseguradora:', error);
        throw error;
      }
    }
  
    async actualizarAseguradora(aseguradoraId: number, aseguradoraData: any): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/aseguradoras/${aseguradoraId}`, aseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al actualizar aseguradora:', error);
        throw error;
      }
    }
  
    async eliminarAseguradora(aseguradoraId: number): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/aseguradoras/${aseguradoraId}`, { estado: 'I' }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar aseguradora:', error);
        throw error;
      }
    }

}
