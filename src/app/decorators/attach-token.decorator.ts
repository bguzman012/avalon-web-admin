import { ApiServiceService } from '../services/api-service.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment'

export function AttachToken(apiService: ApiServiceService) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const context = this;

      const credencialesEncriptadas = localStorage.getItem('cred');
      const bytes = CryptoJS.AES.decrypt(credencialesEncriptadas, environment.secret);
      const credencialesDesencriptadas = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));


      return apiService.loggin(credencialesDesencriptadas.username, credencialesDesencriptadas.password).pipe(
        switchMap((response: any) => {
          const token = response.token;
          context.token = token; // Guardar el token en la instancia
          console.log('Token obtenido:', token);
          return of(originalMethod.apply(context, [token, ...args]));
        })
      ).toPromise();
    };

    return descriptor;
  };
}