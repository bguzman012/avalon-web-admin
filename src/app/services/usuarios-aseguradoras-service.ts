import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UsuariosAseguradorasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }
  
    async guardarUsuariosAseguradoras(usuarioAseguradoraData: any): Promise<any> {
      try {
        console.log(usuarioAseguradoraData)
        const response = await this.http.post<any>(`${this.apiUrl}/usuarioAseguradoras`, usuarioAseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar aseguradora:', error);
        throw error;
      }
    }  

    async updateUsuariosAseguradoras(usuarioAseguradoraData: any, usuarioId: number): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/usuarioAseguradoras?usuarioId=${usuarioId}`, usuarioAseguradoraData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar aseguradora:', error);
        throw error;
      }
    }  

    async obtenerUsuariosPorAseguradoraAndRolAndEstado(aseguradoraId: number, rolId: number, estado: string): Promise<any[]> {
      try {
        const usuarios = await this.http.get<any[]>(`${this.apiUrl}/aseguradoras/${aseguradoraId}/usuarioAseguradoras?estado=${estado}&rolId=${rolId} `).toPromise();
        console.log('Resultado de usuarios por aseguradora y rol:', usuarios);
        return usuarios;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

}
