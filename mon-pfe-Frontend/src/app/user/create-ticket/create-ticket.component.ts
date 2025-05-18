import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { GroupsService, Groupe, SousGroupe } from '../../services/groups.service';
import { AuthService, Utilisateur } from '../../services/auth.service';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.css']
})
export class CreateTicketComponent implements OnInit {
  ticketForm: FormGroup;
  groupes: Groupe[] = [];
  sousGroupes: SousGroupe[] = [];
  filteredSousGroupes: SousGroupe[] = [];
  selectedFiles: File[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  uploadProgress = 0;
  currentUser: Utilisateur | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ticketService: TicketService,
    private groupsService: GroupsService,
    private authService: AuthService
  ) {
    this.ticketForm = this.fb.group({
      sujet: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['INCIDENT', Validators.required],
      urgence: ['MOYENNE', Validators.required],
      groupeId: ['', Validators.required],
      sousGroupeId: ['']
    });
  }

  ngOnInit(): void {
    this.loadGroupes();
    
    // Récupérer l'utilisateur connecté
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.errorMessage = 'Vous devez être connecté pour créer un ticket';
        // Rediriger vers la page de connexion si non connecté
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
    
    // Réagir aux changements de groupe pour filtrer les sous-groupes
    this.ticketForm.get('groupeId')?.valueChanges.subscribe(groupeId => {
      if (groupeId) {
        this.filterSousGroupes(groupeId);
      } else {
        this.filteredSousGroupes = [];
      }
    });
  }

  loadGroupes(): void {
    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groupes = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des groupes', err);
        this.errorMessage = 'Impossible de charger les groupes. Veuillez réessayer.';
      }
    });
  }

  loadSousGroupes(groupeId: number): void {
    this.groupsService.getSousGroupes(groupeId).subscribe({
      next: (data) => {
        this.sousGroupes = data;
        this.filterSousGroupes(groupeId);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sous-groupes', err);
      }
    });
  }

  filterSousGroupes(groupeId: number): void {
    if (this.sousGroupes.length === 0) {
      // Si les sous-groupes ne sont pas encore chargés, les charger d'abord
      this.loadSousGroupes(groupeId);
    } else {
      this.filteredSousGroupes = this.sousGroupes.filter(sg => 
        sg.groupe && sg.groupe.id == groupeId
      );
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedFiles = files;
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.markFormGroupTouched(this.ticketForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifier que l'utilisateur est connecté
    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'Vous devez être connecté pour créer un ticket';
      this.isSubmitting = false;
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Préparer les données du ticket
    const ticketData = {
      ...this.ticketForm.value,
      createurId: this.currentUser.id
    };

    // Envoyer la requête au serveur via le service
    this.ticketService.createTicket(ticketData, this.selectedFiles).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Ticket créé avec succès !';
        this.ticketForm.reset({
          type: 'INCIDENT',
          urgence: 'MOYENNE'
        });
        this.selectedFiles = [];
        
        // Rediriger vers la liste des tickets après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/user/my-tickets']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la création du ticket. ' + 
                           (error.error?.message || 'Veuillez réessayer.');
        console.error('Erreur lors de la création du ticket', error);
      }
    });
  }
}