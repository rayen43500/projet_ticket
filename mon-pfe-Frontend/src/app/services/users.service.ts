import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Déclaration de l'interface Utilisateur 
export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root' // Assure que ce service est accessible dans toute l'application
})
export class UsersService {
  private apiUrl = 'http://localhost:8080/api/users';

  // Injection du service HttpClient pour effectuer des requêtes HTTP
  constructor(private http: HttpClient) {}

  // Méthode pour récupérer tous les utilisateurs
  getAllUsers(): Observable<Utilisateur[]> {

    // Envoie une requête GET à l'API pour récupérer la liste des utilisateurs
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  // Méthode pour supprimer un utilisateur par son ID
  deleteUser(id: number): Observable<any> {
    // Envoie une requête DELETE à l'API pour supprimer l'utilisateur spécifié par l'ID
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Méthode pour ajouter un nouvel utilisateur
  addUser(user: Utilisateur): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, user);
  }

  // Méthode pour mettre à jour les informations d'un utilisateur existant
  updateUser(user: Utilisateur): Observable<any> {
    // Envoie une requête PUT à l'API pour mettre à jour l'utilisateur spécifié par l'ID
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }
}