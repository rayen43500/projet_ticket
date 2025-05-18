import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket } from '../../models/ticket.model';
import { Utilisateur } from '../../models/utilisateur.model';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.css']
})
export class TicketViewComponent implements OnInit {
  ticketId: number;
  ticket: Ticket | null = null;
  currentUser: Utilisateur | null = null;
  commentForm: FormGroup;
  loading = false;
  error = '';
  statusOptions = ['EN_ATTENTE', 'EN_COURS', 'TRAITE', 'CLOTURE'];
  selectedFile: File | null = null;
  uploadProgress = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.ticketId = +this.route.snapshot.paramMap.get('id')!;
    this.commentForm = this.fb.group({
      contenu: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    
    // Récupérer l'utilisateur courant
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user as Utilisateur;
        this.loadTicketDetails();
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération des données utilisateur';
        this.loading = false;
      }
    });
  }

  loadTicketDetails(): void {
    this.ticketService.getTicketById(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération des détails du ticket';
        this.loading = false;
      }
    });
  }

  // Prendre en charge le ticket
  takeTicket(): void {
    if (!this.currentUser || !this.currentUser.id) return;
    
    this.loading = true;
    this.ticketService.assignTicket(this.ticketId, this.currentUser.id).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la prise en charge du ticket';
        this.loading = false;
      }
    });
  }

  // Changer le statut du ticket
  updateStatus(newStatus: string): void {
    this.loading = true;
    this.ticketService.updateTicketStatus(this.ticketId, newStatus).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du statut';
        this.loading = false;
      }
    });
  }

  // Ajouter un commentaire
  submitComment(): void {
    if (this.commentForm.invalid || !this.currentUser || !this.currentUser.id) return;
    
    this.loading = true;
    const commentData = {
      contenu: this.commentForm.value.contenu,
      auteurId: this.currentUser.id
    };
    
    this.ticketService.addComment(this.ticketId, commentData).subscribe({
      next: () => {
        this.commentForm.reset();
        this.loadTicketDetails();
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'ajout du commentaire';
        this.loading = false;
      }
    });
  }

  // Sélectionner un fichier
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  // Uploader une pièce jointe
  uploadFile(): void {
    if (!this.selectedFile || !this.currentUser || !this.currentUser.id) return;
    
    this.loading = true;
    this.uploadProgress = 0;
    
    this.ticketService.uploadAttachment(this.ticketId, this.selectedFile, this.currentUser.id).subscribe({
      next: (event) => {
        // Gérer la progression si nécessaire
        if (typeof event === 'number') {
          this.uploadProgress = Math.round(event * 100);
        } else {
          this.selectedFile = null;
          this.uploadProgress = 0;
          this.loadTicketDetails();
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'upload du fichier';
        this.loading = false;
      }
    });
  }

  // Formater la date
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  // Classes CSS pour les statuts
  getStatusClass(status: string): string {
    switch(status) {
      case 'EN_ATTENTE': return 'status-waiting';
      case 'EN_COURS': return 'status-progress';
      case 'TRAITE': return 'status-done';
      case 'CLOTURE': return 'status-closed';
      default: return '';
    }
  }

  // Classes CSS pour les urgences
  getUrgencyClass(urgency: string): string {
    switch(urgency) {
      case 'FAIBLE': return 'urgency-low';
      case 'MOYENNE': return 'urgency-medium';
      case 'HAUTE': return 'urgency-high';
      default: return '';
    }
  }

  // Revenir à la liste des tickets
  goBack(): void {
    this.router.navigate(['/intervenant/tickets']);
  }
} 