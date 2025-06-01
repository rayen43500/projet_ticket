import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:8080/api/email'; // URL de l'API pour l'envoi d'emails

  constructor(private http: HttpClient) { }

  /**
   * Envoie un email de notification au créateur du ticket lorsque son ticket est clôturé
   * @param ticketId L'ID du ticket clôturé
   * @param userEmail L'email du destinataire (créateur du ticket)
   * @param userName Le nom du destinataire
   * @param ticketSubject Le sujet du ticket
   * @returns Observable avec la réponse du serveur
   */
  sendTicketClosureNotification(
    ticketId: number,
    userEmail: string,
    userName: string,
    ticketSubject: string
  ): Observable<any> {
    const emailData = {
      to: userEmail,
      subject: `Ticket #${ticketId} - Clôture de votre demande`,
      body: `Bonjour ${userName},\n\nNous vous informons que votre ticket "${ticketSubject}" (référence #${ticketId}) a été clôturé.\n\nSi vous avez des questions ou si vous n'êtes pas satisfait de la résolution, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe de support`
    };

    return this.http.post(`${this.baseUrl}/send`, emailData);
  }

  /**
   * Méthode alternative qui utilise un endpoint spécifique pour les notifications de clôture de ticket
   * @param ticketId L'ID du ticket clôturé
   * @returns Observable avec la réponse du serveur
   */
  notifyTicketClosure(ticketId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/notify-closure/${ticketId}`, {});
  }
} 