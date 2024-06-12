import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = `${environment.api_base}:8087`;

  constructor(private http: HttpClient) {}

  async obtenerNotificaciones(): Promise<any[]> {
    try {
      const notificaciones = await this.http.get<any[]>(`${this.apiUrl}/notificaciones`).toPromise();
      console.log('Resultado de notificaciones:', notificaciones);
      return notificaciones;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async obtenerTiposNotificacion(): Promise<any[]> {
    try {
      const tiposNotificaciones = await this.http.get<any[]>(`${this.apiUrl}/tiposNotificacion`).toPromise();
      console.log('Resultado de tipos notificaciones:', tiposNotificaciones);
      return tiposNotificaciones;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async obtenerNotificacionById(notificacionId: number): Promise<any> {
    try {
      const notificacion = await this.http.get<any>(`${this.apiUrl}/notificaciones/${notificacionId}`).toPromise();
      console.log('Resultado de notificación:', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarNotificacion(notificacionData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/notificaciones`, notificacionData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      throw error;
    }
  }

  async actualizarNotificacion(notificacionId: number, notificacionData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/notificaciones/${notificacionId}`, notificacionData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      throw error;
    }
  }


  async eliminarNotificacion(notificacionId: number): Promise<any> {
    try {
      await this.http.delete<any>(`${this.apiUrl}/notificaciones/${notificacionId}`).toPromise();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

}
