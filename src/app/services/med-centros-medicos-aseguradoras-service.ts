import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class MedicoCentroMedicoAseguradorasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  async obtenerMedicoCentroMedicoAseguradorasByAseguradoraAndCentroMedico(
    aseguradoraId: number,
    centroMedicoId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientes = await this.http.get<any[]>(`${this.apiUrl}/aseguradoras/${aseguradoraId}/centrosMedicos/${centroMedicoId}/medicoCentroMedicoAseguradoras?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de centros medicos por medico:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async obtenerMedicoCentroMedicoAseguradorasByMedicoId(
    medicoId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientes = await this.http.get<any[]>(`${this.apiUrl}/medicos/${medicoId}/medicoCentroMedicoAseguradoras?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de centros medicos por medico:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async obtenerMedicoCentroMedicoAseguradorasByAseguradoraId(
    aseguradoId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientes = await this.http.get<any[]>(`${this.apiUrl}/aseguradoras/${aseguradoId}/medicoCentroMedicoAseguradoras?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de centros medicos por aseguradora:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async guardarmedicoCentroMedicoAseguradora(medicoCentroMedicoAseguradoraData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/medicoCentroMedicoAseguradoras`, medicoCentroMedicoAseguradoraData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      throw error;
    }
  }

  async actualizarmedicoCentroMedicoAseguradora(idmedicoCentroMedicoAseguradora: number, medicoCentroMedicoAseguradoraData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/medicoCentroMedicoAseguradoras/${idmedicoCentroMedicoAseguradora}`, medicoCentroMedicoAseguradoraData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      throw error;
    }
  }

}
