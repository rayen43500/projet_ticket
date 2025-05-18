import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { Ticket } from '../../models/ticket.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tickets-to-handle',
  templateUrl: './tickets-to-handle.component.html',
  styleUrls: ['./tickets-to-handle.component.css']
})
export class TicketsToHandleComponent implements OnInit {
  currentUser: Utilisateur | null = null;
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  
  // Tickets regroupés par statut
  ticketsEnAttente: Ticket[] = [];
  ticketsEnCours: Ticket[] = [];
  ticketsTraites: Ticket[] = [];
  ticketsClotures: Ticket[] = [];
  
  loading = false;
  error = '';
  searchTerm = '';
  activeFilter = 'all'; // 'all', 'pending', 'inProgress', 'done', 'closed'
  
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
          this.loadTickets();
        } else {
          this.error = 'Utilisateur non authentifié';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur de récupération de l\'utilisateur', err);
        this.error = 'Erreur lors de la récupération des données utilisateur';
        this.loading = false;
      }
    });
  }

  loadTickets(): void {
    if (!this.currentUser?.id) return;
    
    this.ticketService.getTicketsForIntervenant(this.currentUser.id).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.groupTicketsByStatus();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des tickets', err);
        this.error = 'Erreur lors de la récupération des tickets';
        this.loading = false;
      }
    });
  }

  groupTicketsByStatus(): void {
    this.ticketsEnAttente = this.tickets.filter(t => t.statut === 'EN_ATTENTE');
    this.ticketsEnCours = this.tickets.filter(t => t.statut === 'EN_COURS');
    this.ticketsTraites = this.tickets.filter(t => t.statut === 'TRAITE');
    this.ticketsClotures = this.tickets.filter(t => t.statut === 'CLOTURE');
  }

  applyFilters(): void {
    let filtered = [...this.tickets];
    
    // Filtrer par recherche
    if (this.searchTerm.trim() !== '') {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.sujet.toLowerCase().includes(search) || 
        ticket.description.toLowerCase().includes(search) ||
        (ticket.createur?.nom?.toLowerCase().includes(search))
      );
    }
    
    // Filtrer par statut
    if (this.activeFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'pending': 'EN_ATTENTE',
        'inProgress': 'EN_COURS',
        'done': 'TRAITE',
        'closed': 'CLOTURE'
      };
      
      const status = statusMap[this.activeFilter];
      if (status) {
        filtered = filtered.filter(ticket => ticket.statut === status);
      }
    }
    
    this.filteredTickets = filtered;
  }

  setStatusFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  viewTicketDetails(ticketId: number): void {
    this.router.navigate(['/intervenant/ticket', ticketId]);
  }

  takeTicket(ticket: Ticket): void {
    if (!this.currentUser?.id) return;
    
    this.ticketService.assignTicket(ticket.id!, this.currentUser.id).subscribe({
      next: (updatedTicket) => {
        this.loadTickets(); // Recharger les tickets
      },
      error: (err) => {
        console.error('Erreur lors de la prise en charge', err);
        this.error = 'Erreur lors de la prise en charge du ticket';
      }
    });
  }

  updateTicketStatus(ticket: Ticket, newStatus: string): void {
    this.ticketService.updateTicketStatus(ticket.id!, newStatus).subscribe({
      next: (updatedTicket) => {
        this.loadTickets(); // Recharger les tickets
      },
      error: (err) => {
        console.error('Erreur de mise à jour du statut', err);
        this.error = 'Erreur lors de la mise à jour du statut';
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
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
