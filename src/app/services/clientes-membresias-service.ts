import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ClientesMembresiasService {

  private apiUrl = `${environment.api_base}:8086`;

  constructor(private http: HttpClient) { }

  // async obtenerMembresiasByEstado(estado: string): Promise<any[]> {
  //   try {
  //     const membresias = await this.http.get<any[]>(`${this.apiUrl}/membresias?estado=${estado}`).toPromise();
  //     console.log('Resultado de membresías:', membresias);
  //     return membresias;
  //   } catch (error) {
  //     console.error('Error en la solicitud:', error);
  //     throw error; // Puedes personalizar esto según tus necesidades
  //   }
  // }


  // async obtenerMembresiasByAseguradora(aseguradoraId: number): Promise<any[]> {
  //   try {
  //     const aseguradoras = await this.http.get<any[]>(`${this.apiUrl}/aseguradoras/${aseguradoraId}/membresias`).toPromise();
  //     console.log('Resultado de aseguradoras:', aseguradoras);
  //     return aseguradoras;
  //   } catch (error) {
  //     console.error('Error en la solicitud:', error);
  //     throw error; // Puedes personalizar esto según tus necesidades
  //   }
  // }

  downloadExcel(
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1,
    cliente: string | null = "",
    membresia: string | null = ""): Observable<Blob> {

    const headers = new HttpHeaders({ 'Accept': 'application/octet-stream' });
    const order = sortOrder === 1 ? 'asc' : 'desc';
    const sort = `&sortField=${sortField}&sortOrder=${order}`;

    return this.http.get(`${this.apiUrl}/clienteMembresias/excel?busqueda=${busqueda}${sort}&cliente=${cliente}&membresia=${membresia}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  async obtenerUsuariosMembresias(
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1,
    cliente: string | null = "",
    membresia: string | null = ""): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientes = await this.http.get<any[]>(`${this.apiUrl}/clienteMembresias?page=${page}&size=${size}&busqueda=${busqueda}${sort}&cliente=${cliente}&membresia=${membresia}`).toPromise();
      console.log('Resultado de clientes por usuario membresia:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async obtenerUsuariosMembresiaByMebresiaId(
    membresiaId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientes = await this.http.get<any[]>(`${this.apiUrl}/membresias/${membresiaId}/clienteMembresias?page=${page}&size=${size}&busqueda=${busqueda}${sort}`).toPromise();
      console.log('Resultado de clientes por usuario membresia:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async obtenerUsuariosMembresiaByUsuarioId(
    usuarioId: number,
    page: number,
    size: number,
    busqueda: string,
    sortField: string | null = 'createdDate',
    sortOrder: number | null = -1,
    estado: string | null = ""): Promise<any> {
    try {
      const order = sortOrder === 1 ? 'asc' : 'desc';
      const sort = `&sortField=${sortField}&sortOrder=${order}`;

      const clientes = await this.http.get<any[]>(`${this.apiUrl}/clientes/${usuarioId}/clienteMembresias?page=${page}&size=${size}&busqueda=${busqueda}${sort}&estado=${estado}`).toPromise();
      console.log('Resultado de clientes por usuario membresia:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

  async guardarClienteMembresia(usuarioMembresiaData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/clienteMembresias`, usuarioMembresiaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      throw error;
    }
  }

  async actualizarClienteMembresia(idUsuarioMembresia: number, usuarioMembresiaData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/clienteMembresias/${idUsuarioMembresia}`, usuarioMembresiaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      throw error;
    }
  }

  async actualizarMembresia(membresiaId: number, membresiaData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/membresias/${membresiaId}`, membresiaData).toPromise();
      return response;
    } catch (error) {
      console.error('Error al actualizar membresía:', error);
      throw error;
    }
  }

  async eliminarMembresia(membresiaId: number): Promise<any> {
    try {
      const response = await this.http.patch<any>(`${this.apiUrl}/membresias/${membresiaId}`, { estado: 'I' }).toPromise();
      return response;
    } catch (error) {
      console.error('Error al eliminar membresía:', error);
      throw error;
    }
  }

}
