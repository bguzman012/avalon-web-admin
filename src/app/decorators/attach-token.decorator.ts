import { ApiServiceService } from '../services/api-service.service';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

export function AttachToken(http: HttpClient) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const apiService = new ApiServiceService(http); // Instancia del servicio

    // Recuperar las credenciales encriptadas de LocalStorage
    const credencialesEncriptadas = localStorage.getItem('cred');

    // Desencriptar las credenciales
    const bytes = CryptoJS.AES.decrypt(credencialesEncriptadas, clave);
    const credencialesDesencriptadas = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    descriptor.value = function(...args: any[]) {

      // Llamar al método logginButton del servicio LogginButtonService para obtener el token
      apiService.loggin().subscribe(token => {
        console.log('Token obtenido:', token);
        // Llamar al método original con el token obtenido
        originalMethod.apply(this, [token, ...args]);
      });
    };

    return descriptor;
  };
}