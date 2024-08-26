import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComentariosCitasMedicasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async getComentariosByCitaMedica(citaMedicaId: number): Promise<any[]> {
    try {
      const comentariosCitasMedicas = await this.http.get<any[]>(`${this.apiUrl}/citasMedicas/${citaMedicaId}/comentariosCitasMedicas`).toPromise();
      return comentariosCitasMedicas;
    } catch (error) {
      console.error('Error al obtener comentariosCitasMedicas:', error);
      throw error;
    }
  }

  async createComentario(comentarioData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/comentariosCitasMedicas`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  async updateComentario(comentarioId: number, comentarioData: FormData): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/comentariosCitasMedicas/${comentarioId}`, comentarioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  }

  async deleteComentario(comentarioId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/comentariosCitasMedicas/${comentarioId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }
}
