import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

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

  deleteTiposEvento(token: any, id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.delete<any>(`${this.apiUrl}:8099/tiposEvento/` + id, { headers })
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

  guardarTipoEvento(token: any, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });

    console.log(datos)

    return this.http.post<any>(`${this.apiUrl}:8099/tiposEvento`, datos, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de guardar tipo evento:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }



  loggin(username: string, password: string): Observable<any> {
    const data = {
      "usuario": username,
      "contrasenia": password
    }
    return this.http.post<any>(`${this.apiUrl}:8086/login`, data);
  }



  obtenerTiposMascota(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.get<any>(`${this.apiUrl}:8082/tiposMascota`, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  deleteTiposMascota(token: any, id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.delete<any>(`${this.apiUrl}:8082/tiposMascota/` + id, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  guardarTipoMascota(token: any, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });

    return this.http.post<any>(`${this.apiUrl}:8082/tiposMascota`, datos, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de guardar tipo evento:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }
  

  // RAZAS
  obtenerRazas(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.get<any>(`${this.apiUrl}:8082/razas`, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  deleteRazas(token: any, id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.delete<any>(`${this.apiUrl}:8082/razas/` + id, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  guardarRaza(token: any, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });

    return this.http.post<any>(`${this.apiUrl}:8082/razas`, datos, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de guardar tipo evento:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  // CATEGORIAS SOLICITUDES AMISTAD
  
  obtenerCategoriasSolicitud(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.get<any>(`${this.apiUrl}:8086/categoriasSolcitudAmistad`, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  deleteCategoriaSolicitud(token: any, id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.delete<any>(`${this.apiUrl}:8086/categoriasSolcitudAmistad/` + id, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  guardarCategoriaSolicitud(token: any, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });

    return this.http.post<any>(`${this.apiUrl}:8086/categoriasSolcitudAmistad`, datos, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de guardar:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  // USUARIOS

  obtenerUsuarios(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.get<any>(`${this.apiUrl}:8086/usuarios`, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de obtener:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  patchEstado(token: any, id: any, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });
  
    return this.http.patch<any>(`${this.apiUrl}:8086/usuarios/` + id, datos, { headers, observe: 'response' })
      .pipe(
        tap((response) => {
          if (response instanceof HttpResponse) {
            // Solicitud exitosa
            const statusCode = response.status;
            console.log('Código de estado (éxito):', statusCode);
          }
  
          // Resto de la lógica aquí...
          console.log('Resultado de obtener:', response.body);
        }),
        catchError((error) => {
          if (error instanceof HttpErrorResponse) {
            // Error en la solicitud
            const statusCode = error.status;
            console.error('Error en la solicitud. Código de estado:', statusCode);
          }
  
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }

  guardarUsuarios(token: any, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': token
    });

    return this.http.post<any>(`${this.apiUrl}:8086/usuarios`, datos, { headers })
      .pipe(
        tap((result) => {
          console.log('Resultado de guardar tipo evento:', result);
        }),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(error); // Puedes personalizar esto según tus necesidades
        })
      );
  }
  
    // ROL
  
    obtenerRoles(token: any): Observable<any> {
      const headers = new HttpHeaders({
        'Authorization': token
      });
    
      return this.http.get<any>(`${this.apiUrl}:8086/roles`, { headers })
        .pipe(
          tap((result) => {
            console.log('Resultado de obtener:', result);
          }),
          catchError((error) => {
            console.error('Error en la solicitud:', error);
            return throwError(error); // Puedes personalizar esto según tus necesidades
          })
        );
    }
  
    deleteRol(token: any, id: any): Observable<any> {
      const headers = new HttpHeaders({
        'Authorization': token
      });
    
      return this.http.delete<any>(`${this.apiUrl}:8086/roles/` + id, { headers })
        .pipe(
          tap((result) => {
            console.log('Resultado de obtener:', result);
          }),
          catchError((error) => {
            console.error('Error en la solicitud:', error);
            return throwError(error); // Puedes personalizar esto según tus necesidades
          })
        );
    }
  
    guardarRol(token: any, datos: any): Observable<any> {
      const headers = new HttpHeaders({
        'Authorization': token
      });
  
      return this.http.post<any>(`${this.apiUrl}:8086/roles`, datos, { headers })
        .pipe(
          tap((result) => {
            console.log('Resultado de guardar:', result);
          }),
          catchError((error) => {
            console.error('Error en la solicitud:', error);
            return throwError(error); // Puedes personalizar esto según tus necesidades
          })
        );
    }
  

}
