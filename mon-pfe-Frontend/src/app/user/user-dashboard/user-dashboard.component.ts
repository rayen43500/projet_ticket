import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { AuthService, Utilisateur } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userName: string = 'Utilisateur';
  pendingTickets: number = 0;
  inProgressTickets: number = 0;
  resolvedTickets: number = 0;
  totalTickets: number = 0;
  recentTickets: Ticket[] = [];
  currentUser: Utilisateur | null = null;
  loading: boolean = true;
  
  constructor(
    private ticketService: TicketService, 
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté via le service d'authentification
    this.currentUser = this.authService.getSessionUser();
    if (this.currentUser && this.currentUser.nom) {
      this.userName = this.currentUser.nom;
    }
    
    // S'abonner aux changements de l'utilisateur
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userName = user.nom;
        
        // Une fois l'utilisateur récupéré, charger les tickets
        this.loadUserTickets();
      }
    });
    
    // Si déjà authentifié, charger les tickets directement
    if (this.currentUser?.id) {
      this.loadUserTickets();
    }
  }

  loadUserTickets(): void {
    this.loading = true;
    
    if (!this.currentUser || !this.currentUser.id) {
      console.error('Utilisateur non connecté');
      this.loading = false;
      return;
    }

    // Utiliser le service pour récupérer les tickets de l'utilisateur
    this.ticketService.getUserTickets(this.currentUser.id)
      .subscribe(
        (tickets: Ticket[]) => {
          this.recentTickets = tickets.sort((a, b) => 
            new Date(b.dateCreation!).getTime() - new Date(a.dateCreation!).getTime()
          ).slice(0, 5); // Prendre les 5 tickets les plus récents
          
          // Calculer les statistiques
          this.totalTickets = tickets.length;
          this.pendingTickets = tickets.filter(t => t.statut === 'EN_ATTENTE').length;
          this.inProgressTickets = tickets.filter(t => t.statut === 'EN_COURS').length;
          this.resolvedTickets = tickets.filter(t => t.statut === 'TRAITE' || t.statut === 'CLOTURE').length;
          this.loading = false;
        },
        (error: any) => {
          console.error('Erreur lors du chargement des tickets', error);
          this.loading = false;
        }
      );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-pending';
      case 'EN_COURS': return 'status-in-progress';
      case 'TRAITE': 
      case 'CLOTURE': return 'status-resolved';
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

  logout(): void {
    // Utiliser le service d'authentification pour la déconnexion
    this.authService.logout();
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }
}
