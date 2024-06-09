import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("INTERCEPTING");
    const authToken = this.authService.getToken();
    
    const isExcludedUrl = request.url.includes('login');
    
    let authReq = request;

    if (authToken !== null && !isExcludedUrl) {
      authReq = request.clone({
        setHeaders: { Authorization: authToken }
      });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error.status === 401 && !isExcludedUrl) {
          return this.handleUnauthorizedError(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const newAuthToken = this.authService.getToken();
        const authReq = request.clone({
          setHeaders: { Authorization: `${newAuthToken}` }
        });
        return next.handle(authReq);
      })
    );
  }
}
