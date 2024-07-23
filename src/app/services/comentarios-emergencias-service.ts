import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComentariosEmergenciasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async getComentariosByEmergencia(citaMedicaId: number): Promise<any[]> {
    try {
      const comentariosEmergencias = await this.http.get<any[]>(`${this.apiUrl}/emergencias/${citaMedicaId}/comentariosEmergencias`).toPromise();
      return comentariosEmergencias;
    } catch (error) {
      console.error('Error al obtener comentariosEmergencias:', error);
      throw error;
    }
  }

  async createComentario(comentarioData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/comentariosEmergencias`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  async updateComentario(comentarioId: number, comentarioData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/comentariosEmergencias/${comentarioId}`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  }

  async deleteComentario(comentarioId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/comentariosEmergencias/${comentarioId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }
}
