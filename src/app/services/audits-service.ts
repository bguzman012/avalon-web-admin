import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, catchError, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AuditsService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) {
  }

  async obtenerAudits(
    filters: {},
    page: number,
    size: number,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1
  ): Promise<any> {
    try {
      const filters_param = `&busquedaEntityName=${filters['entityName']}&busquedaOperation=${filters['operation']}&busquedaId=${filters['entityId']}&busquedaCreatedDate=${filters['createdDate']}&busquedaUser=${filters['createdBy']}`;

      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      console.log(`${this.apiUrl}/entityAudits?page=${page}&size=${size}${filters_param}${sort}`)
      const audits = await this.http.get<any[]>(`${this.apiUrl}/entityAudits?page=${page}&size=${size}${filters_param}${sort}`).toPromise();
      console.log('Resultado de audits:', audits);
      return audits;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

}
