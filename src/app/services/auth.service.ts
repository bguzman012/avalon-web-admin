import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment'


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.api_base}:8086`;
  private tokenKey = 'token_key';
  private idKey= 'info_ad';
  private credenciales = 'cred';
  private secretKey = environment.secret; // Deberías almacenar esta clave de forma segura

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    const data = { usuario: username, contrasenia: password };
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      map(response => response),
      tap(response => this.setCredencials(response.token, response.id, username, password))
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

  clearToken(): void {  
    localStorage.removeItem(this.tokenKey);
  }
}