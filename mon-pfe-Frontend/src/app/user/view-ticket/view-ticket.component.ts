import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { Ticket } from '../../models/ticket.model';

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
  currentUser: Utilisateur | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getSessionUser();
  }

  ngOnInit(): void {
    // Subscribe to auth changes
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    
    // Load ticket based on route param
    this.route.params.subscribe(params => {
      const ticketId = params['id'];
      if (ticketId) {
        this.loadTicket(+ticketId);
      }
    });
  }

  loadTicket(id: number): void {
    this.loading = true;
    this.error = '';

    this.ticketService.getTicketById(id)
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

      formatDate(date: Date | string | undefined): string {    return date ? new Date(date).toLocaleDateString('fr-FR') : '';  }

  addComment(): void {
    if (!this.newComment.trim() || !this.ticket) {
      return;
    }

    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'Utilisateur non connecté';
      return;
    }

    const commentData = {
      auteurId: this.currentUser.id,
      contenu: this.newComment
    };

    this.ticketService.addComment(this.ticket.id!, commentData)
      .subscribe(
        () => {
          // Recharger les détails du ticket pour afficher le nouveau commentaire
          this.loadTicket(this.ticket!.id!);
          this.newComment = '';
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du commentaire', error);
          this.error = 'Erreur lors de l\'ajout du commentaire';
        }
      );
  }

  goBack(): void {
    this.router.navigate(['/user/my-tickets']);
  }
}
