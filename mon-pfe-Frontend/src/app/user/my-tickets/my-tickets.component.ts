import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Interface pour définir la structure d'un ticket
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
  selector: 'app-my-tickets',
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  loading = true;
  error = '';
  searchTerm = '';
  statusFilter = 'all';
  ticket: Partial<Ticket> = this.getEmptyTicket();
  attachments: File[] = [];
  
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = '';
    
    // Récupérer l'utilisateur connecté
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    // Appel à l'API pour récupérer les tickets de l'utilisateur
    this.http.get<Ticket[]>(`${environment.apiUrl}/tickets/user/${currentUser.id}`)
      .subscribe(
        (data) => {
          this.tickets = data;
          this.applyFilters();
          this.loading = false;
        },
        (error) => {
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
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
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

  selectTicket(ticket: Ticket): void {
    if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
      this.selectedTicket = null;
    } else {
      // Charger les détails complets du ticket
      this.http.get<Ticket>(`${environment.apiUrl}/tickets/${ticket.id}`)
        .subscribe(
          (data) => {
            this.selectedTicket = data;
          },
          (error) => {
            console.error('Erreur lors du chargement des détails du ticket', error);
          }
        );
    }
  }

  closeTicketDetails(): void {
    this.selectedTicket = null;
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

  addComment(ticketId: number, comment: string): void {
    if (!comment.trim()) {
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      console.error('Utilisateur non connecté');
      return;
    }

    const commentData = new FormData();
    commentData.append('auteurId', currentUser.id.toString());
    commentData.append('contenu', comment);

    this.http.post(`${environment.apiUrl}/tickets/${ticketId}/comments`, commentData)
      .subscribe(
        () => {
          // Recharger les détails du ticket pour afficher le nouveau commentaire
          this.http.get<Ticket>(`${environment.apiUrl}/tickets/${ticketId}`)
            .subscribe(
              (data) => {
                this.selectedTicket = data;
              },
              (error) => {
                console.error('Erreur lors du rechargement des détails du ticket', error);
              }
            );
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du commentaire', error);
        }
      );
  }

  getEmptyTicket(): Partial<Ticket> {
    return {
      sujet: '',
      description: '',
      urgence: 'FAIBLE',
      type: 'incident',
      groupeNom: '',
      sousGroupeNom: '',
    };
  }

  closeForm(): void {
    this.selectedTicket = null;
    this.ticket = this.getEmptyTicket();
    this.attachments = [];
  }

  onSubmit(): void {
    if (!this.ticket.sujet || !this.ticket.description || !this.ticket.urgence || !this.ticket.type || !this.ticket.groupeNom || !this.ticket.sousGroupeNom) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      this.error = 'Utilisateur non connecté';
      return;
    }
    const formData = new FormData();
    formData.append('sujet', this.ticket.sujet);
    formData.append('description', this.ticket.description);
    formData.append('urgence', this.ticket.urgence);
    formData.append('type', this.ticket.type);
    formData.append('groupeNom', this.ticket.groupeNom);
    formData.append('sousGroupeNom', this.ticket.sousGroupeNom);
    formData.append('createurId', currentUser.id.toString());
    this.attachments.forEach(file => formData.append('piecesJointes', file));
    this.http.post(`${environment.apiUrl}/tickets`, formData)
      .subscribe(
        () => {
          this.loadTickets();
          this.closeForm();
        },
        (error) => {
          this.error = "Erreur lors de la création du ticket.";
        }
      );
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachments = Array.from(input.files);
    }
  }
}
