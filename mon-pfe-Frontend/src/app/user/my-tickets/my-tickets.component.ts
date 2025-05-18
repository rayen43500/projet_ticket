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
  selectedTicket: Ticket | null = null;
  loading = true;
  error = '';
  searchTerm = '';
  statusFilter = 'all';
  ticket: Partial<Ticket> = this.getEmptyTicket();
  attachments: File[] = [];
  currentUser: Utilisateur | null = null;
  
  constructor(
    private ticketService: TicketService, 
    private router: Router,
    private authService: AuthService
  ) {
    // Ensure ticket has groupe and sousGroupe initialized
    this.ticket = this.getEmptyTicket();
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

  selectTicket(ticket: Ticket): void {
    if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
      this.selectedTicket = null;
    } else {
      // Charger les détails complets du ticket
      this.ticketService.getTicketById(ticket.id!)
        .subscribe(
          (data: Ticket) => {
            this.selectedTicket = data;
          },
          (error: any) => {
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
                this.selectedTicket = data;
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

  getEmptyTicket(): Partial<Ticket> {
    return {
      sujet: '',
      description: '',
      urgence: 'FAIBLE' as 'FAIBLE',
      type: 'INCIDENT' as 'INCIDENT',
      groupe: {
        id: 0,
        nom: ''
      },
      sousGroupe: {
        id: 0,
        nom: ''
      }
    };
  }

  closeForm(): void {
    this.selectedTicket = null;
    this.ticket = this.getEmptyTicket();
    this.attachments = [];
  }

  onSubmit(): void {
    // Ensure ticket has required groupe and sousGroupe objects
    this.ensureTicketHasGroupObjects();
    
    if (!this.ticket.sujet || !this.ticket.description || !this.ticket.urgence || !this.ticket.type || 
        !this.ticket.groupe?.nom || !this.ticket.sousGroupe?.nom) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    
    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'Utilisateur non connecté';
      return;
    }

    // Préparer les données du ticket
    const ticketData = {
      sujet: this.ticket.sujet,
      description: this.ticket.description,
      type: this.ticket.type,
      urgence: this.ticket.urgence,
      createurId: this.currentUser.id,
      groupeId: this.ticket.groupe!.id || this.getGroupIdByName(this.ticket.groupe!.nom),
      sousGroupeId: this.ticket.sousGroupe!.id || this.getSousGroupIdByName(this.ticket.sousGroupe!.nom)
    };

    this.ticketService.createTicket(ticketData, this.attachments)
      .subscribe(
        () => {
          this.loadTickets();
          this.closeForm();
        },
        (error: any) => {
          this.error = "Erreur lors de la création du ticket.";
          console.error('Erreur de création de ticket', error);
        }
      );
  }

  // Méthode pour garantir que les objets groupe et sousGroupe existent
  ensureTicketHasGroupObjects(): void {
    if (!this.ticket.groupe) {
      this.ticket.groupe = {
        id: 0,
        nom: ''
      };
    }
    
    if (!this.ticket.sousGroupe) {
      this.ticket.sousGroupe = {
        id: 0,
        nom: ''
      };
    }
  }

  // Méthodes d'aide pour convertir les noms en IDs
  getGroupIdByName(name: string): number {
    const groupMapping: { [key: string]: number } = {
      'Finance': 1,
      'Informatique': 2,
      'Ressources Humaines': 3
    };
    return groupMapping[name] || 0;
  }

  getSousGroupIdByName(name: string): number {
    const sousGroupMapping: { [key: string]: number } = {
      'Comptabilité': 1,
      'Réseau': 2,
      'Paie': 3
    };
    return sousGroupMapping[name] || 0;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachments = Array.from(input.files);
    }
  }
}
