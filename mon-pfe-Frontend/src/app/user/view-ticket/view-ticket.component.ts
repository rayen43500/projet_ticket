import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Ticket {
  id: number;
  sujet: string;
  description: string;
  dateCreation: Date;
  statut: string;
  type: string;
  urgence: string;
  createurId: number;
  createurNom: string;
  intervenantId?: number;
  intervenantNom?: string;
  groupeId: number;
  groupeNom: string;
  sousGroupeId?: number;
  sousGroupeNom?: string;
  commentaires?: any[];
  piecesJointes?: any[];
}

@Component({
  selector: 'app-view-ticket',
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.css']
})
export class ViewTicketComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = true;
  error = '';
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const ticketId = params['id'];
      if (ticketId) {
        this.loadTicket(ticketId);
      }
    });
  }

  loadTicket(id: number): void {
    this.loading = true;
    this.error = '';

    this.http.get<Ticket>(`${environment.apiUrl}/tickets/${id}`)
      .subscribe(
        (data) => {
          this.ticket = data;
          this.loading = false;
        },
        (error) => {
          console.error('Erreur lors du chargement du ticket', error);
          this.error = 'Impossible de charger les détails du ticket. Veuillez réessayer.';
          this.loading = false;
        }
      );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-pending';
      case 'EN_COURS': return 'status-in-progress';
      case 'TRAITE': return 'status-resolved';
      case 'CLOTURE': return 'status-closed';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'FAIBLE': return 'priority-low';
      case 'MOYENNE': return 'priority-medium';
      case 'HAUTE': return 'priority-high';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.ticket) {
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      console.error('Utilisateur non connecté');
      return;
    }

    const commentData = new FormData();
    commentData.append('auteurId', currentUser.id.toString());
    commentData.append('contenu', this.newComment);

    this.http.post(`${environment.apiUrl}/tickets/${this.ticket.id}/comments`, commentData)
      .subscribe(
        () => {
          // Recharger les détails du ticket pour afficher le nouveau commentaire
          this.loadTicket(this.ticket!.id);
          this.newComment = '';
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du commentaire', error);
        }
      );
  }

  goBack(): void {
    this.router.navigate(['/user/my-tickets']);
  }
}
