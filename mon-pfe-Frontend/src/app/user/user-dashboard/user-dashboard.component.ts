import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Ticket {
  id: number;
  sujet: string;
  description: string;
  dateCreation: Date;
  statut: string;
  urgence: string;
  createurNom: string;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userName: string = 'John Doe';
  pendingTickets: number = 0;
  inProgressTickets: number = 0;
  resolvedTickets: number = 0;
  totalTickets: number = 0;
  recentTickets: Ticket[] = [];
  
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté depuis le localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.nom) {
      this.userName = currentUser.nom;
    }
    
    // Charger les tickets de l'utilisateur
    this.loadUserTickets();
  }

  loadUserTickets(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      console.error('Utilisateur non connecté');
      return;
    }

    // Appel à l'API pour récupérer les tickets de l'utilisateur
    this.http.get<Ticket[]>(`${environment.apiUrl}/tickets/user/${currentUser.id}`)
      .subscribe(
        (tickets) => {
          this.recentTickets = tickets.sort((a, b) => 
            new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
          ).slice(0, 5); // Prendre les 5 tickets les plus récents
          
          // Calculer les statistiques
          this.totalTickets = tickets.length;
          this.pendingTickets = tickets.filter(t => t.statut === 'EN_ATTENTE').length;
          this.inProgressTickets = tickets.filter(t => t.statut === 'EN_COURS').length;
          this.resolvedTickets = tickets.filter(t => t.statut === 'TRAITE' || t.statut === 'CLOTURE').length;
        },
        (error) => {
          console.error('Erreur lors du chargement des tickets', error);
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
    // Supprimer les informations de l'utilisateur du localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }
}
