import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { of } from 'rxjs';  
import { map, catchError, tap } from 'rxjs/operators';

export interface Utilisateur {
  id?: number;
  nom: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'INTERVENANT' | 'UTILISATEUR' | string;
  groupe?: any;
}

export interface AuthResponse {
  utilisateur: Utilisateur;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';  // URL de mon API backend
  private loggedIn = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(this.getSessionUser());
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    // Vérifier le token au démarrage
    this.checkTokenExpiration();
  }

  // Méthode d'inscription avec bcrypt (le hachage est fait côté serveur)
  register(utilisateur: Utilisateur): Observable<AuthResponse | boolean> {
    return this.http.post<AuthResponse | boolean>(`${this.baseUrl}/register`, utilisateur)
      .pipe(
        tap(response => {
          // Seulement gérer l'authentification si la réponse est un objet AuthResponse
          if (response && typeof response === 'object' && 'token' in response) {
            this.handleAuthentication(response as AuthResponse);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Méthode de connexion avec JWT
  login(utilisateur: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, utilisateur)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  // Gestionnaire d'authentification
  private handleAuthentication(authResponse: AuthResponse): void {
    if (!authResponse || !authResponse.token || !authResponse.utilisateur) {
      return;
    }

    // Nettoyer l'utilisateur pour éviter la récursion
    const cleanUser = this.cleanRecursiveResponse(authResponse.utilisateur);
    
    // Forcer le rôle pour int@gmail.com
    if (cleanUser.email === 'int@gmail.com') {
      cleanUser.role = 'INTERVENANT';
    }
    
    // Stocker le token et l'utilisateur
    localStorage.setItem('auth_token', authResponse.token);
    if (authResponse.refreshToken) {
      localStorage.setItem('refresh_token', authResponse.refreshToken);
    }
    if (authResponse.expiresIn) {
      const expirationDate = new Date(new Date().getTime() + authResponse.expiresIn * 1000);
      localStorage.setItem('token_expiration', expirationDate.toISOString());
      this.autoLogout(authResponse.expiresIn * 1000);
    }
    
    // Mettre à jour l'état d'authentification
    this.currentUserSubject.next(cleanUser);
    this.loggedIn.next(true);
    
    // Enregistrer l'utilisateur en session pour compatibilité
    sessionStorage.setItem('connectedUser', JSON.stringify(cleanUser));
  }

  // Gérer les erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 401) {
        errorMessage = 'Identifiants incorrects';
      } else if (error.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Méthode pour nettoyer une réponse API récursive
  cleanRecursiveResponse(user: any): Utilisateur {
    if (!user) return user;

    // Créer un nouvel objet utilisateur propre avec seulement les informations essentielles
    const cleanUser: Utilisateur = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role
    };

    // Si l'utilisateur a un groupe, ajouter les informations basiques du groupe sans les intervenants
    if (user.groupe) {
      cleanUser.groupe = {
        id: user.groupe.id,
        nom: user.groupe.nom
      };
    }

    return cleanUser;
  }

  // Vérifier si un token valide existe
  hasValidToken(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    const expirationDate = localStorage.getItem('token_expiration');
    if (!expirationDate) return true; // Si pas de date, on suppose que le token est valide
    
    return new Date() < new Date(expirationDate);
  }
  
  // Déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiration');
    sessionStorage.removeItem('connectedUser');
    
    this.currentUserSubject.next(null);
    this.loggedIn.next(false);
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
  
  // Déconnexion automatique à l'expiration du token
  autoLogout(expirationDuration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
  
  // Vérifier l'expiration du token au démarrage
  checkTokenExpiration(): void {
    const expirationDate = localStorage.getItem('token_expiration');
    if (!expirationDate) return;
    
    const expirationTime = new Date(expirationDate).getTime();
    const now = new Date().getTime();
    const expiresIn = expirationTime - now;
    
    if (expiresIn > 0) {
      this.autoLogout(expiresIn);
    } else {
      this.logout();
    }
  }
  
  // Rafraîchir le token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return throwError(() => new Error('Pas de token de rafraîchissement'));
    }
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }
  
  // Obtenir le token d'authentification
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Méthodes pour la compatibilité avec le code existant
  
  // Méthode pour vérifier si l'utilisateur est connecté
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // Récupérer l'utilisateur connecté
  getSessionUser(): Utilisateur | null {
    // Tenter d'abord de récupérer depuis le localStorage (JWT)
    const token = localStorage.getItem('auth_token');
    if (token) {
      const userData = sessionStorage.getItem('connectedUser');
      if (userData) {
        return JSON.parse(userData);
      }
    }
    
    // Fallback vers l'ancienne méthode
    const user = sessionStorage.getItem('connectedUser');
    return user ? JSON.parse(user) : null;
  }

  // Récupérer l'utilisateur actuel (de la session)
  getCurrentUser(): Observable<Utilisateur | null> {
    return this.currentUserSubject.asObservable();
  }
  
  // Vérifier si l'utilisateur est un admin
  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => !!user && (user.role === 'ADMIN' || user.role === 'admin'))
    );
  }
  
  // Vérifier si l'utilisateur est un intervenant
  isIntervenant(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        // Vérifier par email et par rôle pour double sécurité
        const isIntervenantRole = !!user && (user.role === 'INTERVENANT' || user.role === 'intervenant');
        const isIntervenantEmail = !!user && user.email === 'int@gmail.com';
        
        console.log(`Vérification Intervenant: Email=${isIntervenantEmail}, Role=${isIntervenantRole}`);
        return isIntervenantRole || isIntervenantEmail;
      })
    );
  }
  
  // Vérifier si l'utilisateur est un utilisateur standard
  isUser(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => !!user && (user.role === 'UTILISATEUR' || user.role === 'utilisateur'))
    );
  }
  
  // Récupérer le rôle de l'utilisateur actuel
  getUserRole(): Observable<string | null> {
    return this.getCurrentUser().pipe(
      map(user => user ? user.role : null)
    );
  }
}
