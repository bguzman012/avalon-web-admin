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

}
