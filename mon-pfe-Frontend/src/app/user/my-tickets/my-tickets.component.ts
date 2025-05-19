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
  attachments: File[] = [];
  currentUser: Utilisateur | null = null;
  isEditMode = false;
  
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

  selectTicket(ticket: Ticket): void {
    // Charger les détails complets du ticket pour édition
    this.ticketService.getTicketById(ticket.id!)
      .subscribe(
        (data: Ticket) => {
          this.selectedTicket = data;
          this.isEditMode = true;
          this.ensureTicketHasGroupObjects();
        },
        (error: any) => {
          console.error('Erreur lors du chargement des détails du ticket', error);
        }
      );
  }

  createNewTicket(): void {
    this.selectedTicket = this.getEmptyTicket();
    this.isEditMode = false;
    this.ensureTicketHasGroupObjects();
  }

  closeForm(): void {
    this.selectedTicket = null;
    this.isEditMode = false;
    this.attachments = [];
  }

  onSubmit(): void {
    if (!this.selectedTicket) return;
    
    // Ensure ticket has required groupe and sousGroupe objects
    this.ensureTicketHasGroupObjects();
    
    if (!this.selectedTicket.sujet || !this.selectedTicket.description || !this.selectedTicket.urgence || !this.selectedTicket.type || 
        !this.selectedTicket.groupe?.nom || !this.selectedTicket.sousGroupe?.nom) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    
    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'Utilisateur non connecté';
      return;
    }

    if (this.isEditMode) {
      this.updateTicket();
    } else {
      this.createTicket();
    }
  }

  updateTicket(): void {
    if (!this.selectedTicket || !this.selectedTicket.id) return;
    
    // Préparer les données du ticket à mettre à jour
    const ticketData = {
      id: this.selectedTicket.id,
      sujet: this.selectedTicket.sujet,
      description: this.selectedTicket.description,
      type: this.selectedTicket.type,
      urgence: this.selectedTicket.urgence,
      groupeId: this.selectedTicket.groupe!.id || this.getGroupIdByName(this.selectedTicket.groupe!.nom),
      sousGroupeId: this.selectedTicket.sousGroupe!.id || this.getSousGroupIdByName(this.selectedTicket.sousGroupe!.nom)
    };

    // Utiliser la méthode updateTicket du service
    this.ticketService.updateTicket(ticketData)
      .subscribe(
        () => {
          this.loadTickets();
          this.closeForm();
        },
        (error: any) => {
          this.error = "Erreur lors de la mise à jour du ticket.";
          console.error('Erreur de mise à jour de ticket', error);
        }
      );
  }

  createTicket(): void {
    if (!this.selectedTicket) return;
    
    // Check that we have a user with an ID
    if (!this.currentUser || !this.currentUser.id) {
      return;
    }
    
    // Préparer les données du nouveau ticket
    const ticketData = {
      sujet: this.selectedTicket.sujet,
      description: this.selectedTicket.description,
      type: this.selectedTicket.type,
      urgence: this.selectedTicket.urgence,
      createurId: this.currentUser.id, // Ensure this is not undefined
      groupeId: this.selectedTicket.groupe!.id || this.getGroupIdByName(this.selectedTicket.groupe!.nom),
      sousGroupeId: this.selectedTicket.sousGroupe!.id || this.getSousGroupIdByName(this.selectedTicket.sousGroupe!.nom)
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
    if (!this.selectedTicket) return;
    
    if (!this.selectedTicket.groupe) {
      this.selectedTicket.groupe = {
        id: 0,
        nom: ''
      };
    }
    
    if (!this.selectedTicket.sousGroupe) {
      this.selectedTicket.sousGroupe = {
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

  getEmptyTicket(): Ticket {
    return {
      sujet: '',
      description: '',
      statut: 'EN_ATTENTE',
      urgence: 'FAIBLE',
      type: 'INCIDENT',
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
}
