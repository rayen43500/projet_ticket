import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { Ticket } from '../../models/ticket.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intervenant-dashboard',
  templateUrl: './intervenant-dashboard.component.html',
  styleUrls: ['./intervenant-dashboard.component.css']
})
export class IntervenantDashboardComponent implements OnInit {
  currentUser: Utilisateur | null = null;
  ticketsEnAttente: Ticket[] = [];
  ticketsEnCours: Ticket[] = [];
  ticketsTraites: Ticket[] = [];
  ticketsRecents: Ticket[] = [];
  stats = {
    total: 0,
    enAttente: 0,
    enCours: 0,
    traites: 0,
    clotures: 0
  };
  loading = false;
  error = '';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user && user.id) {
          this.loadIntervenantTickets();
          this.loadTicketStats();
        } else {
          this.error = 'Utilisateur non authentifié';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération des données utilisateur';
        this.loading = false;
      }
    });
  }

  loadIntervenantTickets(): void {
    if (!this.currentUser?.id) return;
    
    // Tickets assignés à l'intervenant
    this.ticketService.getTicketsForIntervenant(this.currentUser.id).subscribe({
      next: (tickets) => {
        this.filterTicketsByStatus(tickets);
        this.ticketsRecents = [...tickets].sort((a, b) => 
          new Date(b.dateCreation || 0).getTime() - new Date(a.dateCreation || 0).getTime()
        ).slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération des tickets';
        this.loading = false;
      }
    });
  }

  loadTicketStats(): void {
    if (!this.currentUser?.id) return;
    
    this.ticketService.getTicketsStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des statistiques', err);
      }
    });
  }

  filterTicketsByStatus(tickets: Ticket[]): void {
    this.ticketsEnAttente = tickets.filter(t => t.statut === 'EN_ATTENTE');
    this.ticketsEnCours = tickets.filter(t => t.statut === 'EN_COURS');
    this.ticketsTraites = tickets.filter(t => t.statut === 'TRAITE');
  }

  viewTicketDetails(ticketId: number): void {
    this.router.navigate(['/intervenant/ticket', ticketId]);
  }

  takeTicket(ticket: Ticket): void {
    if (!this.currentUser?.id) return;
    
    this.ticketService.assignTicket(ticket.id!, this.currentUser.id).subscribe({
      next: (updatedTicket) => {
        this.loadIntervenantTickets(); // Recharger les tickets
      },
      error: (err) => {
        this.error = 'Erreur lors de la prise en charge du ticket';
      }
    });
  }

  updateTicketStatus(ticket: Ticket, newStatus: string): void {
    this.ticketService.updateTicketStatus(ticket.id!, newStatus).subscribe({
      next: (updatedTicket) => {
        this.loadIntervenantTickets(); // Recharger les tickets
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du statut';
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'EN_ATTENTE': return 'status-waiting';
      case 'EN_COURS': return 'status-progress';
      case 'TRAITE': return 'status-done';
      case 'CLOTURE': return 'status-closed';
      default: return '';
    }
  }

  getUrgencyClass(urgency: string): string {
    switch(urgency) {
      case 'FAIBLE': return 'urgency-low';
      case 'MOYENNE': return 'urgency-medium';
      case 'HAUTE': return 'urgency-high';
      default: return '';
    }
  }
}
