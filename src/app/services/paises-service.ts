import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }
  
  async obtenerPaises(): Promise<any[]> {
    try {
      const paises = await this.http.get<any[]>(`${this.apiUrl}/paises`).toPromise();
      console.log('Resultado de paises:', paises);
      return paises;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }
}
