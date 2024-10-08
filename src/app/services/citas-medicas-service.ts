import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment'
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CitasMedicasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) {
  }

  downloadExcel(
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1,
    casoId: string | null = ""): Observable<Blob> {

    const headers = new HttpHeaders({ 'Accept': 'application/octet-stream' });
    const order = sortOrder === 1 ? 'asc' : 'desc';
    const sort = `&sortField=${sortField}&sortOrder=${order}`;

    return this.http.get(`${this.apiUrl}/citasMedicas/excel?busqueda=${busqueda}${sort}&casoId=${casoId}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  async obtenerCitasMedicas(
    estado: string,
    clientePolizaId: string,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1,
    casoId: string | null = ""
  ): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;
      const citasMedicas = await this.http.get<any[]>(`${this.apiUrl}/citasMedicas?estado=${estado}&clientePolizaId=${clientePolizaId}&casoId=${casoId}&page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de citasMedicas:', citasMedicas);
      return citasMedicas;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error;
    }
  }

  async guardarCitaMedica(citaMedicaData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/citasMedicas`, citaMedicaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar cita medica:', error);
      throw error;
    }
  }


  async actualizarCitaMedica(citaMedicaId: number, citaMedicaData: FormData): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`, citaMedicaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async getCitaMedica(citaMedicaId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar cita medica:', error);
      throw error;
    }
  }

  async eliminarCitaMedica(citaMedicaId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`, {estado: 'I'}).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar cita medica:', error);
      throw error;
    }
  }

  async partiallyUpdateCitaMedica(
    citaMedicaId: number,
    partiallyUpdateObject): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/citasMedicas/${citaMedicaId}`, partiallyUpdateObject).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar  part. cita medica:', error);
      throw error;
    }
  }
}
