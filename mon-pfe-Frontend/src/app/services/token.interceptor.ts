import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    // Si nous avons un token, l'ajouter à l'en-tête
    if (token) {
      request = this.addToken(request, token);
    }
    
    // Passer la requête au prochain gestionnaire
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // La requête a échoué avec une erreur 401 (Non autorisé)
          return this.handle401Error(request, next);
        } else {
          // Propager l'erreur
          return throwError(() => error);
        }
      })
    );
  }

  // Ajouter le token à l'en-tête
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Gérer les erreurs 401 (Non autorisé)
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si nous ne sommes pas déjà en train de rafraîchir le token
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      
      // Tenter de rafraîchir le token
      return this.authService.refreshToken().pipe(
        switchMap(token => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token.token));
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.authService.logout(); // Déconnecter l'utilisateur si le rafraîchissement échoue
          return throwError(() => error);
        })
      );
    } else {
      // Si nous sommes déjà en train de rafraîchir le token, attendre que ce soit terminé
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt.token));
        })
      );
    }
  }
} 