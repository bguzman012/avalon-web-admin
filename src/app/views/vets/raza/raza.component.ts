import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../../../services/api-service.service';
import { catchError, concatMap, switchMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-raza',
  templateUrl: './raza.component.html',
  styleUrls: ['./raza.component.scss']
})
export class RazaComponent implements OnInit {

  public favoriteColor = '#26ab3c';
  visible = false;
  danger = false;

  token: any
  tiposMascota: any[] = []
  razas: any[] = []
  raza: any = {
    id: null,
    nombre: "",
    descripcion: "",
    tipoMascota: {
        id: null,
        nombre: "",
        descripcion: ""
    }
};

tipoMascotaId: any = null

constructor(private servicio: ApiServiceService, private router: Router) { 
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn == false)
    this.router.navigate(['/login']);
  
}
  ngOnInit(): void {
    this.getTiposMascotasAuth()
    this.getRazasAuth()
    console.log("TIPOS MASCOTAS " + this.razas)
    // Lógica para obtener datos...
  }

  setDatos(raza: any) {
    this.raza = raza
    this.tipoMascotaId = raza.tipoMascota.id
  }

  guardarDatos() {
    console.log(this.raza)
    let razaSave = {
      id: this.raza.id,
      nombre: this.raza.nombre,
      descripcion: this.raza.descripcion,
      tipoMascotaId: this.tipoMascotaId
    }
    this.servicio.loggin().pipe(
      concatMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token);
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.guardarRaza(responseEnviarDatos.token, razaSave);
      }),
      concatMap(() => {
        // Luego de guardar los datos, llamar a getrazassAuth
        return this.servicio.loggin().pipe(
          concatMap((responseEnviarDatos) => {
            console.log(responseEnviarDatos.token);
            // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
            return this.servicio.obtenerRazas(responseEnviarDatos.token);
          })
        );
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
        this.razas = responseObtenerDatos;
        this.raza = {}
        this.tipoMascotaId = null
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
    this.servicio.loggin().pipe(
      concatMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token);
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.deleteRazas(responseEnviarDatos.token, id)
          .pipe(
            catchError((error) => {
              // Manejar el error del servicio deleteRazas
              console.error('Error al eliminar el tipo de Mascota:', error);
              // Utilizar la propiedad status del objeto de error para obtener el código de estado
              return of(error.status || null);
            })
          );
      }),
      concatMap((statusCode) => {
        console.log(statusCode, "STATUS CODE");
        // Devolver el código de estado en ambos casos (éxito y error)
        return of(statusCode);
      }),
      concatMap((statusCode) => {
        if (statusCode === 200 || statusCode === null) {
          // Código de respuesta 200 o nulo: realizar acciones adicionales
          return this.servicio.loggin().pipe(
            concatMap((responseEnviarDatos) => {
              console.log(responseEnviarDatos.token);
              // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
              return this.servicio.obtenerRazas(responseEnviarDatos.token);
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
  
        this.razas = responseObtenerDatos;
        this.raza = {};
        this.tipoMascotaId = null
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
  

  getRazasAuth() {
    const data = { /* ...tu objeto de datos... */ };

    // Enviar datos y luego realizar la segunda solicitud con los datos enviados
    this.servicio.loggin().pipe(
      switchMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token)
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.obtenerRazas(responseEnviarDatos.token);
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
        this.razas = responseObtenerDatos
      },
      (error) => {
        console.error('Error al enviar o obtener datos:', error);
      }
    );
  }

  getTiposMascotasAuth() {
    const data = { /* ...tu objeto de datos... */ };

    // Enviar datos y luego realizar la segunda solicitud con los datos enviados
    this.servicio.loggin().pipe(
      switchMap((responseEnviarDatos) => {
        console.log(responseEnviarDatos.token)
        // Utilizar responseEnviarDatos como parámetro en la segunda solicitud
        return this.servicio.obtenerTiposMascota(responseEnviarDatos.token);
      })
    ).subscribe(
      (responseObtenerDatos) => {
        console.log('Respuesta del servidor al obtener datos:', responseObtenerDatos);
        this.tiposMascota = responseObtenerDatos
      },
      (error) => {
        console.error('Error al enviar o obtener datos:', error);
      }
    );
  }


}
