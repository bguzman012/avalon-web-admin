import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class MembresiasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async obtenerMembresiasByEstado(estado: string): Promise<any[]> {
    try {
      const membresias = await this.http.get<any[]>(`${this.apiUrl}/membresias?estado=${estado}`).toPromise();
      console.log('Resultado de membresías:', membresias);
      return membresias;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async guardarMembresia(membresiaData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/membresias`, membresiaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      throw error;
    }
  }

  async actualizarMembresia(membresiaId: number, membresiaData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/membresias/${membresiaId}`, membresiaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar membresía:', error);
      throw error;
    }
  }

  async eliminarMembresia(membresiaId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/membresias/${membresiaId}`, { estado: 'I' }).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar membresía:', error);
      throw error;
    }
  }

}
