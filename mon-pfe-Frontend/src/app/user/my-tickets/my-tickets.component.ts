import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { AuthService, Utilisateur } from '../../services/auth.service';

@Component({
  selector: 'app-my-tickets',
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  statusFilter = 'all';
  currentUser: Utilisateur | null = null;
  
  constructor(
    private ticketService: TicketService, 
    private router: Router,
    private authService: AuthService
  ) {
    // Get current user
    this.currentUser = this.authService.getSessionUser();
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTickets();
      }
    });
    
    // If already authenticated, load tickets
    if (this.currentUser?.id) {
      this.loadTickets();
    }
  }

  loadTickets(): void {
    this.loading = true;
    this.error = '';
    
    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    // Utiliser le service pour récupérer les tickets de l'utilisateur
    this.ticketService.getUserTickets(this.currentUser.id)
      .subscribe(
        (data: Ticket[]) => {
          this.tickets = data;
          this.applyFilters();
          this.loading = false;
        },
        (error: any) => {
          console.error('Erreur lors du chargement des tickets', error);
          this.error = 'Impossible de charger les tickets. Veuillez réessayer.';
          this.loading = false;
        }
      );
  }

  applyFilters(): void {
    let filtered = [...this.tickets];
    
    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.sujet.toLowerCase().includes(term) || 
        ticket.description.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.statut === this.statusFilter);
    }
    
    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => 
      new Date(b.dateCreation!).getTime() - new Date(a.dateCreation!).getTime()
    );
    
    this.filteredTickets = filtered;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
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

  formatDate(date: Date | undefined | string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  addComment(ticketId: number, comment: string): void {
    if (!comment.trim()) {
      return;
    }

    if (!this.currentUser || !this.currentUser.id) {
      console.error('Utilisateur non connecté');
      return;
    }

    const commentData = {
      auteurId: this.currentUser.id,
      contenu: comment
    };

    this.ticketService.addComment(ticketId, commentData)
      .subscribe(
        () => {
          // Recharger les détails du ticket pour afficher le nouveau commentaire
          this.ticketService.getTicketById(ticketId)
            .subscribe(
              (data: Ticket) => {
                // Handle comment added
              },
              (error: any) => {
                console.error('Erreur lors du rechargement des détails du ticket', error);
              }
            );
        },
        (error: any) => {
          console.error('Erreur lors de l\'ajout du commentaire', error);
        }
      );
  }
}
