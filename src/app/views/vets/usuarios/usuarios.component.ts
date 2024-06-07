import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../../../services/api-service.service';
import { catchError, concatMap, switchMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  public favoriteColor = '#26ab3c';
  visible = false;
  danger = false;

  token: any
  usuarios: any[] = []
  usuario: any =   {
    createdBy: "",
    createdDate: "",
    lastModifiedBy: "",
    lastModifiedDate: "",
    id: 0,
    usuario: "",
    contrasenia: "",
    correoElectronico: "",
    sobrenombre: "",
    estado: "",
    documentoIdentificacion: "",
    fechaNacimiento: "",
    nombres: "",
    apellidos: "",
    ubicacionLatitud: null,
    ubicacionLongitud: null,
    telefono: "",
    rol: {
      id: null,
      nombre: "",
      observaciones: ""
    },
    urlFotoPerfil: "",
    urlFotoSenecytDoc: "",
    urlFotoRecordPolicial: "",
    referenciaPersonal: "",
    direccion: ""
  }

  constructor(private servicio: ApiServiceService, private router: Router) { 
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn == false)
      this.router.navigate(['/login']);
    
  }

  ngOnInit(): void {
    this.getUsuariosAuth()
    console.log("USUARIOS " + this.usuarios)
    // Lógica para obtener datos...
  }

  setDatos(usuario: any) {
    this.usuario = usuario
    console.log(this.usuario)
  }

  guardarDatos() {
    console.log(this.usuario)
    this.servicio.loggin().pipe(
      concatMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token);
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.guardarUsuarios(responseEnviarDatos.token, this.usuario);
      }),
      concatMap(() => {
        // Luego de guardar los datos, llamar a getCategoriasSolicitudAuth
        return this.servicio.loggin().pipe(
          concatMap((responseEnviarDatos) => {
            console.log(responseEnviarDatos.token);
            // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
            return this.servicio.obtenerUsuarios(responseEnviarDatos.token);
          })
        );
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
        this.usuarios = responseObtenerDatos;
        this.usuario = {}
        this.visible = true
        // Ocultar el alert después de 2 segundos
        setTimeout(() => {
          this.visible = false;
        }, 2000);
      },
      (error) => {
        console.error('Error al enviar o obtener datos:', error);
      }
    );

  }
  delete(id: any) {
    let estado_usuario = {
      estado: 'I'
    }
    this.servicio.loggin().pipe(
      concatMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token);
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.patchEstado(responseEnviarDatos.token, id, estado_usuario)
          .pipe(
            catchError((error) => {
              // Manejar el error del servicio deleteTiposMascota
              console.error('Error al eliminar:', error);
              // Utilizar la propiedad status del objeto de error para obtener el código de estado
              return of(error.status || null);
            })
          );
      }),
      concatMap((statusCode) => {
        // Devolver el código de estado en ambos casos (éxito y error)
        return of(statusCode.status);
      }),
      concatMap((statusCode) => {
        if (statusCode === 200 || statusCode === null) {
          // Código de respuesta 200 o nulo: realizar acciones adicionales
          return this.servicio.loggin().pipe(
            concatMap((responseEnviarDatos) => {
              console.log(responseEnviarDatos.token);
              // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
              return this.servicio.obtenerUsuarios(responseEnviarDatos.token);
            })
          );
        } else {
          this.danger = true;
          // Ocultar el alert después de 2 segundos
          setTimeout(() => {
            this.danger = false;
          }, 2000);
          // Código de respuesta diferente de 200 o nulo: realizar otras acciones
          console.error('Código de respuesta no es 200:', statusCode);
          return EMPTY; // En este ejemplo, se usa "EMPTY" de RxJS para no emitir ningún valor y completar la secuencia.
        }
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
  
        // Realizar acciones adicionales después de obtener datos (si es necesario)
  
        this.usuarios = responseObtenerDatos;
        this.usuario = {};
        this.visible = true;
        // Ocultar el alert después de 2 segundos
        setTimeout(() => {
          this.visible = false;
        }, 2000);
      },
      (error) => {
        console.error('Error al enviar o obtener datos:', error);
      }
    );
  }

  activar(id: any) {
    let estado_usuario = {
      estado: 'A'
    }
    this.servicio.loggin().pipe(
      concatMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token);
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.patchEstado(responseEnviarDatos.token, id, estado_usuario)
          .pipe(
            catchError((error) => {
              // Manejar el error del servicio deleteTiposMascota
              console.error('Error al eliminar:', error);
              // Utilizar la propiedad status del objeto de error para obtener el código de estado
              return of(error.status || null);
            })
          );
      }),
      concatMap((statusCode) => {
        // Devolver el código de estado en ambos casos (éxito y error)
        return of(statusCode.status);
      }),
      concatMap((statusCode) => {
        if (statusCode === 200 || statusCode === null) {
          // Código de respuesta 200 o nulo: realizar acciones adicionales
          return this.servicio.loggin().pipe(
            concatMap((responseEnviarDatos) => {
              console.log(responseEnviarDatos.token);
              // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
              return this.servicio.obtenerUsuarios(responseEnviarDatos.token);
            })
          );
        } else {
          this.danger = true;
          // Ocultar el alert después de 2 segundos
          setTimeout(() => {
            this.danger = false;
          }, 2000);
          // Código de respuesta diferente de 200 o nulo: realizar otras acciones
          console.error('Código de respuesta no es 200:', statusCode);
          return EMPTY; // En este ejemplo, se usa "EMPTY" de RxJS para no emitir ningún valor y completar la secuencia.
        }
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
  
        // Realizar acciones adicionales después de obtener datos (si es necesario)
  
        this.usuarios = responseObtenerDatos;
        this.usuario = {};
        this.visible = true;
        // Ocultar el alert después de 2 segundos
        setTimeout(() => {
          this.visible = false;
        }, 2000);
      },
      (error) => {
        console.error('Error al enviar o obtener datos:', error);
      }
    );
  }
  

  getUsuariosAuth() {
    const data = { /* ...tu objeto de datos... */ };

    // Enviar datos y luego realizar la segunda solicitud con los datos enviados
    this.servicio.loggin().pipe(
      switchMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token)
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.obtenerUsuarios(responseEnviarDatos.token);
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
        this.usuarios = responseObtenerDatos
      },
      (error) => {
        console.error('Error al enviar o obtener datos:', error);
      }
    );
  }


}
