import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, catchError, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BeneficiosService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(
    private http: HttpClient) {
  }

  async obtenerBeneficios(): Promise<any[]> {
    try {
      const beneficios = await this.http.get<any[]>(`${this.apiUrl}/beneficios`).toPromise();
      console.log('Resultado de beneficios:', beneficios);
      return beneficios;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }


  async obtenerBeneficiosByMembresia(
    membresiaId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const beneficios = await this.http.get<any[]>(`${this.apiUrl}/membresias/${membresiaId}/beneficios?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de beneficios:', beneficios);
      return beneficios;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async guardarBeneficio(beneficioData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/beneficios`, beneficioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar beneficio:', error);
      throw error;
    }
  }

  async actualizarBeneficio(beneficioId: number, beneficioData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/beneficios/${beneficioId}`, beneficioData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar beneficio:', error);
      throw error;
    }
  }

  async eliminarBeneficio(beneficioId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/beneficios/${beneficioId}`, {estado: 'I'}).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar beneficio:', error);
      throw error;
    }
  }
}
