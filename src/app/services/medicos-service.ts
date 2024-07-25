import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {}

  async createMedico(medicoData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/medicos`, medicoData).toPromise();
      return response;
    } catch (error) {
      console.error('Error creating carga familiar:', error);
      throw error;
    }
  }

  async getMedicos(
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1
  ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;
      const medicos = await this.http.get<any[]>(`${this.apiUrl}/medicos?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      return medicos;
    } catch (error) {
      console.error('Error fetching cargas familiares by cliente poliza:', error);
      throw error;
    }
  }

  async getMedicoById(medicoId: number): Promise<any> {
    try {
      const medico = await this.http.get<any>(`${this.apiUrl}/medicos/${medicoId}`).toPromise();
      return medico;
    } catch (error) {
      console.error('Error fetching carga familiar by ID:', error);
      throw error;
    }
  }

  async updateMedico(medicoId: number, medicoData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/medicos/${medicoId}`, medicoData).toPromise();
      return response;
    } catch (error) {
      console.error('Error updating carga familiar:', error);
      throw error;
    }
  }

  async deleteMedico(medicoId: number): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.apiUrl}/medicos/${medicoId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error deleting carga familiar:', error);
      throw error;
    }
  }
}
