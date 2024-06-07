import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  // private apiUrl = 'http://167.114.68.106';
  private apiUrl = 'http://localhost';


  constructor(private http: HttpClient) { }
  
  obtenerTiposEvento(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.get<any>(`${this.apiUrl}:8099/tiposEvento`, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtenerTiposEvento:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

}
