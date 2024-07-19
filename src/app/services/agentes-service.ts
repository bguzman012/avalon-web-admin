import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AgentesService {
  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {}

  async obtenerAgentesPorBrokerAndEstado(
    brokerId: number,
    estado: string,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1
  ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const usuarios = await this.http
        .get<any[]>(`${this.apiUrl}/brokers/${brokerId}/agentes?estado=${estado}&page=${page}&size=${size}&busqueda=${busqueda}${sort}`)
        .toPromise();
      console.log(`Resultado de brokers ${brokerId}:`, usuarios);
      return usuarios;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

}
