import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }
  
  async obtenerEstadosByPais(paisId: number): Promise<any[]> {
    try {
      const paises = await this.http.get<any[]>(`${this.apiUrl}/paises/${paisId}/estados`).toPromise();
      console.log('Resultado de reclamaciones:', paises);
      return paises;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

}
