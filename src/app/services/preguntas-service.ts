import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {

  private apiUrl = `${environment.api_base}:8087`;

  constructor(private http: HttpClient) {}

  async obtenerPreguntas(): Promise<any[]> {
    try {
      const preguntas = await this.http.get<any[]>(`${this.apiUrl}/preguntas`).toPromise();
      console.log('Resultado de preguntas:', preguntas);
      return preguntas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarPregunta(preguntaData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/preguntas`, preguntaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar pregunta:', error);
      throw error;
    }
  }

  async actualizarPregunta(preguntaId: number, preguntaData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/preguntas/${preguntaId}`, preguntaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar pregunta:', error);
      throw error;
    }
  }

  async eliminarPregunta(preguntaId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/preguntas/${preguntaId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
      throw error;
    }
  }
}
