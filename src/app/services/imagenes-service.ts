import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async getImagen(imagenId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/imagenes/${imagenId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
      throw error;
    }
  }

}
