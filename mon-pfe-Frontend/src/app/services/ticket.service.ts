import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ticket } from '../models/ticket.model';

interface TicketCreateData {
  sujet: string;
  description: string;
  type: string;
  urgence: string;
  createurId: number;
  groupeId: number;
  sousGroupeId?: number;
  [key: string]: any; // Index signature to allow string indexing
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) { }

  // Récupérer tous les tickets
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  // Récupérer les tickets assignés à un intervenant
  getTicketsForIntervenant(intervenantId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/intervenant/${intervenantId}`);
  }

  // Récupérer les tickets d'un groupe
  getTicketsForGroupe(groupeId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/groupe/${groupeId}`);
  }

  // Récupérer les tickets par statut
  getTicketsByStatus(statut: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/statut/${statut}`);
  }

  // Récupérer un ticket par son id
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  // Créer un nouveau ticket avec possibilité de pièces jointes
  createTicket(ticketData: TicketCreateData, files?: File[]): Observable<Ticket> {
    console.log('Données du ticket avant envoi:', ticketData);
    
    // Essayer une approche alternative avec URLSearchParams
    // pour la création de tickets sans pièces jointes
    if (!files || files.length === 0) {
      console.log('Essai avec URLSearchParams (pas de fichiers)');
      
      const params = new HttpParams()
        .set('sujet', ticketData.sujet)
        .set('description', ticketData.description)
        .set('type', ticketData.type)
        .set('urgence', ticketData.urgence)
        .set('createurId', ticketData.createurId.toString())
        .set('groupeId', ticketData.groupeId.toString());
      
      // Ajouter le sousGroupeId si présent
      const finalParams = ticketData.sousGroupeId 
        ? params.set('sousGroupeId', ticketData.sousGroupeId.toString())
        : params;
      
      const options = {
        params: finalParams,
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
      
      return this.http.post<Ticket>(this.baseUrl, null, options);
    }
    
    console.log('Utilisation de FormData (avec fichiers)');
    // Utiliser FormData pour l'envoi de fichiers et de données
    const formData = new FormData();
    
    // Ajouter les données du ticket de manière explicite
    formData.append('sujet', ticketData.sujet);
    formData.append('description', ticketData.description);
    formData.append('type', ticketData.type);
    formData.append('urgence', ticketData.urgence);
    formData.append('createurId', ticketData.createurId.toString());
    formData.append('groupeId', ticketData.groupeId.toString());
    
    if (ticketData.sousGroupeId) {
      formData.append('sousGroupeId', ticketData.sousGroupeId.toString());
    }
    
    // Ajouter les fichiers s'il y en a
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    // Déboggage - listez les clés qui ont été ajoutées
    console.log('FormData créé avec les champs:', 
                'sujet, description, type, urgence, createurId, groupeId, ' +
                (ticketData.sousGroupeId ? 'sousGroupeId, ' : '') +
                (files && files.length > 0 ? 'files' : ''));

    // Ne pas spécifier de Content-Type, laissez le navigateur le définir avec boundary
    return this.http.post<Ticket>(this.baseUrl, formData, { withCredentials: true });
  }

  // Mettre à jour le statut d'un ticket
  updateTicketStatus(id: number, newStatus: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/statut`, { statut: newStatus });
  }

  // Prendre en charge un ticket (assigner à un intervenant)
  assignTicket(ticketId: number, intervenantId: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/assign`, { intervenantId });
  }

  // Ajouter un commentaire
  addComment(ticketId: number, commentData: { contenu: string, auteurId: number }): Observable<any> {
    const params = new URLSearchParams();
    params.append('auteurId', commentData.auteurId.toString());
    params.append('contenu', commentData.contenu);
    
    return this.http.post(`${this.baseUrl}/${ticketId}/comments?${params.toString()}`, {});
  }

  // Upload d'une pièce jointe avec progression
  uploadAttachment(ticketId: number, file: File, uploaderId: number): Observable<HttpEvent<any> | number> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('uploaderId', uploaderId.toString());
    
    const req = new HttpRequest('POST', `${this.baseUrl}/${ticketId}/attachment`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    
    return this.http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              return event.loaded / event.total;
            }
            return 0;
          case HttpEventType.Response:
            return event;
          default:
            return event;
        }
      })
    );
  }

  // Obtenir des statistiques sur les tickets
  getTicketsStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }

  // Rechercher des tickets
  searchTickets(criteria: any): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(`${this.baseUrl}/search`, criteria);
  }
} 