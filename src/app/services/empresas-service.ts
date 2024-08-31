import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) { }

    async obtenerEmpresas(
      page: number,
      size: number,
      busqueda: string,
      sortField: string | null = 'createdDate',
      sortOrder: number | null = -1
    ): Promise<any> {
      try {
        const order = sortOrder === 1 ? 'asc' : 'desc';
        const sort = `&sortField=${sortField}&sortOrder=${order}`;

        const empresas = await this.http.get<any[]>(`${this.apiUrl}/empresas?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
        console.log('Resultado de empresas:', empresas);
        return empresas;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; // Puedes personalizar esto según tus necesidades
      }
    }

    async guardarEmpresa(empresaData: any): Promise<any> {
      try {
        const response = await this.http.post<any>(`${this.apiUrl}/empresas`, empresaData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al guardar empresa:', error);
        throw error;
      }
    }

    async actualizarEmpresa(empresaId: number, empresaData: any): Promise<any> {
      try {
        const response = await this.http.put<any>(`${this.apiUrl}/empresas/${empresaId}`, empresaData).toPromise();
        return response;
      } catch (error) {
        console.error('Error al actualizar empresa:', error);
        throw error;
      }
    }

    async eliminarEmpresa(empresaId: number): Promise<any> {
      try {
        const response = await this.http.patch<any>(`${this.apiUrl}/empresas/${empresaId}`, { estado: 'I' }).toPromise();
        return response;
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        throw error;
      }
    }

}
