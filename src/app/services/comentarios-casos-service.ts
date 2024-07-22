import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComentariosCasosService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async getComentariosByCaso(citaMedicaId: number): Promise<any[]> {
    try {
      const comentariosCasos = await this.http.get<any[]>(`${this.apiUrl}/casos/${citaMedicaId}/comentariosCasos`).toPromise();
      return comentariosCasos;
    } catch (error) {
      console.error('Error al obtener comentariosCasos:', error);
      throw error;
    }
  }

  async createComentario(comentarioData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/comentariosCasos`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  async updateComentario(comentarioId: number, comentarioData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/comentariosCasos/${comentarioId}`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  }

  async deleteComentario(comentarioId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/comentariosCasos/${comentarioId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }
}
