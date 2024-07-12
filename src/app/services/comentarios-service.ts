import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async getComentariosByReclamacion(reclamacionId: number): Promise<any[]> {
    try {
      const comentarios = await this.http.get<any[]>(`${this.apiUrl}/reclamaciones/${reclamacionId}/comentarios`).toPromise();
      return comentarios;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  }

  async createComentario(comentarioData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/comentarios`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  async updateComentario(comentarioId: number, comentarioData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/comentarios/${comentarioId}`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  }

  async deleteComentario(comentarioId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/comentarios/${comentarioId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }
}