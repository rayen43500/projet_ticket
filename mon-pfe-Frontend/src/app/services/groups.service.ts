import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  role: 'ADMIN' | 'INTERVENANT' | 'UTILISATEUR';
  groupe?: { id: number }; 
}

export interface Groupe {
  id?: number;
  nom: string;
  intervenants: Utilisateur[];
}

export interface SousGroupe {
  id?: number;
  nom: string;
  groupe?: Groupe;
}

@Injectable({
  providedIn: 'root'
})

export class GroupsService {
  private apiUrl = 'http://localhost:8080/api/groupes';
  private sousGroupesUrl = 'http://localhost:8080/api/sous-groupes';
  private usersUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides. Veuillez vérifier votre saisie.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Code d'erreur : ${error.status}, Message : ${error.message}`;
      }
    }

     console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // Récupérer tous les groupes
  getGroups(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(this.apiUrl).pipe(
      map((groups: any[]) => groups.map(g => ({
        id: g.id,
        nom: g.nom,
        intervenants: g.intervenants || [] // Assure la compatibilité avec l'interface
      }))),
      catchError(this.handleError)
    );
  }

  // Récupérer un groupe par ID
  getGroupById(id: number): Observable<Groupe> {
    return this.http.get<Groupe>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les sous-groupes d'un groupe
  getSousGroupes(groupeId: number): Observable<SousGroupe[]> {
    return this.http.get<SousGroupe[]>(`${this.sousGroupesUrl}?groupeId=${groupeId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Créer un nouveau groupe - rétrocompatible avec l'ancienne signature
  createGroup(group: Groupe, intervenantIds?: number[]): Observable<Groupe> {
    // Si intervenantIds n'est pas fourni, l'extraire du groupe
    const ids = intervenantIds || group.intervenants.map(i => i.id);
    
    let params = new HttpParams();
    ids.forEach(id => {
      params = params.append('intervenantIds', id.toString());
    });
    
    // Le corps contient uniquement le nom pour éviter les problèmes de sérialisation
    const payload = { nom: group.nom };
    
    return this.http.post<Groupe>(this.apiUrl, payload, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour un groupe existant - rétrocompatible avec l'ancienne signature
  updateGroup(id: number, group: Groupe, intervenantIds?: number[]): Observable<Groupe> {
    // Si intervenantIds n'est pas fourni, l'extraire du groupe
    const ids = intervenantIds || group.intervenants.map(i => i.id);
    
    let params = new HttpParams();
    ids.forEach(id => {
      params = params.append('intervenantIds', id.toString());
    });
    
    // Le corps contient uniquement le nom pour éviter les problèmes de sérialisation
    const payload = { nom: group.nom };
    
    return this.http.put<Groupe>(`${this.apiUrl}/${id}`, payload, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un groupe
  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer tous les intervenants
  getIntervenants(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.usersUrl}?role=INTERVENANT`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les intervenants non assignés
  getUnassignedIntervenants(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.usersUrl}?role=INTERVENANT`).pipe(
      map((intervenants: Utilisateur[]) => 
        intervenants.filter(intervenant => !intervenant.groupe || !intervenant.groupe.id)
      ),
      catchError(this.handleError)
    );
  }
}