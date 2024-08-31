import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, from} from 'rxjs';
import {catchError, map, tap, switchMap} from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import {environment} from '../../environments/environment'


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.api_base}:8086`;
  private tokenKey = 'token_key';
  private idKey = 'info_ad';
  private credenciales = 'cred';
  private dosFA = 'fa';
  private secretKey = environment.secret; // Deberías almacenar esta clave de forma segura

  constructor(private http: HttpClient) {
  }

  login(username: string,
        password: string,
        generate2FA: string | null = ''): Observable<any> {
    const data = {usuario: username, contrasenia: password};
    return this.http.post<any>(`${this.apiUrl}/login?generate2FA=${generate2FA}`, data).pipe(
      map(response => response),
      tap(response => this.setCredencials(response.token, response.id, username, password))
    );
  }

  verifyCode(username: string, codigo: string): Observable<any> {
    const data = {
      usuario: username,
      codigo: codigo
    };
    return this.http.post<any>(`${this.apiUrl}/verify-code`, data).pipe(
      map(response => response)
    );
  }

  enviarCodigo2FA(username: string): Observable<any> {
    const data = {
      userName: username
    };
    return this.http.post<any>(`${this.apiUrl}/send-code`, data).pipe(
      map(response => response)
    );
  }

  changePassw(username: string, contraseniaActual: string, contraseniaNueva: string): Observable<any> {
    const data = {
      usuario: username,
      contraseniaActual: contraseniaActual,
      contraseniaNueva: contraseniaNueva
    };
    return this.http.post<any>(`${this.apiUrl}/change-password`, data).pipe(
      map(response => response)
    );
  }

  refreshToken(): Observable<string> {
    const data = this.getCredencials();
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      map(response => response),
      tap(response => this.setCredencials(response.token, response.id, data.username, data.password))
    );
  }

  getToken(): string | null {
    const encryptedToken = localStorage.getItem(this.tokenKey);
    if (encryptedToken) {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  getAutenticadoDosFA(): string | null {
    const encryptedAuthDosFA = localStorage.getItem(this.dosFA);
    if (encryptedAuthDosFA) {
      const bytes = CryptoJS.AES.decrypt(encryptedAuthDosFA, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  getId(): string | null {
    const encryptedId = localStorage.getItem(this.idKey);
    if (encryptedId) {
      const bytes = CryptoJS.AES.decrypt(encryptedId, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  getCredencials(): any | null {
    const encryptedCredentials = localStorage.getItem(this.credenciales);
    if (encryptedCredentials) {
      const bytes = CryptoJS.AES.decrypt(encryptedCredentials, environment.secret);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
  }

  setCredencials(token: string, id: number, username: string, password: string): void {
    const encryptedToken = CryptoJS.AES.encrypt(token, this.secretKey).toString();
    const encryptedId = CryptoJS.AES.encrypt(String(id), this.secretKey).toString();

    const credenciales = {
      username: username,
      password: password
    };
    const credencialesEncriptadas = CryptoJS.AES.encrypt(JSON.stringify(credenciales), environment.secret).toString();

    localStorage.setItem(this.credenciales, credencialesEncriptadas);
    localStorage.setItem(this.tokenKey, encryptedToken);
    localStorage.setItem(this.idKey, encryptedId);
  }

  setAutenticado2FA(): void {
    const encryptedAuthDosFA = CryptoJS.AES.encrypt("AUTENTICADO_2FA", this.secretKey).toString();

    localStorage.setItem(this.dosFA, encryptedAuthDosFA);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  clearAll(): void {
    localStorage.clear();
  }

  async obtenerUsuarioLoggeado(): Promise<any> {
    try {
      const usuario = await this.http.get<any>(`${this.apiUrl}/usuarios/${this.getId()}`).toPromise();
      console.log('Resultado de roles:', usuario);
      return usuario;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // Puedes personalizar esto según tus necesidades
    }
  }

}
