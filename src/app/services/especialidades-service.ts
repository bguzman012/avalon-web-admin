import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {}

  async getEspecialidades(
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1
  ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;
      const especialidades = await this.http.get<any[]>(`${this.apiUrl}/especialidades?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      return especialidades;
    } catch (error) {
      console.error('Error fetching especialidades:', error);
      throw error;
    }
  }

  async getEspecialidadById(especialidadId: number): Promise<any> {
    try {
      const especialidad = await this.http.get<any>(`${this.apiUrl}/especialidades/${especialidadId}`).toPromise();
      return especialidad;
    } catch (error) {
      console.error('Error fetching especialidad by ID:', error);
      throw error;
    }
  }
}
