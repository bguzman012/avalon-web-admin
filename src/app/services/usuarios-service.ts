import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }
  
    async obtenerUsuariosPorRolAndEstado(rolId: number, estado: string): Promise<any[]> {
      try {
        const usuarios = await this.http.get<any[]>(`${this.apiUrl}/roles/${rolId}/usuarios?estado=${estado}`).toPromise();
        console.log('Resultado de roles:', usuarios);
        return usuarios;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

    async guardarUsuario(usuarioData: any): Promise<any> {
      try {
        const response = await this.http.post<any>(`${this.apiUrl}/usuarios`, usuarioData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        throw error;
      }
    }
  
    async actualizarUsuario(usuarioId: number, usuarioData: any): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/usuarios/${usuarioId}`, usuarioData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
      }
    }
  
    async eliminarUsuario(usuarioId: number): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/usuarios/${usuarioId}`, { estado: 'I', contrasenia: null }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
      }
    }

    async partiallyUpdateUsuario(usuarioId: number, estado: String): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/usuarios/${usuarioId}`, { estado: estado, contrasenia: null }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
      }
    }

}
