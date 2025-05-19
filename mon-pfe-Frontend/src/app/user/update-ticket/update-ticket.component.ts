import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { GroupsService, Groupe, SousGroupe } from '../../services/groups.service';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-update-ticket',
  templateUrl: './update-ticket.component.html',
  styleUrls: ['./update-ticket.component.css']
})
export class UpdateTicketComponent implements OnInit {
  ticketForm: FormGroup;
  groupes: Groupe[] = [];
  sousGroupes: SousGroupe[] = [];
  filteredSousGroupes: SousGroupe[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentUser: Utilisateur | null = null;
  ticket: Ticket | null = null;
  ticketId: number | null = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
    
    // Get ticket ID from route parameters
    this.route.params.subscribe(params => {
      this.ticketId = +params['id']; // Convert to number
      if (this.ticketId) {
        this.loadTicket(this.ticketId);
      } else {
        this.router.navigate(['/user/my-tickets']);
      }
    });
    
    // Get current user
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.errorMessage = 'Vous devez être connecté pour modifier un ticket';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
    
    // React to group changes to filter subgroups
    this.ticketForm.get('groupeId')?.valueChanges.subscribe(groupeId => {
      if (groupeId) {
        this.filterSousGroupes(+groupeId);
      } else {
        this.filteredSousGroupes = [];
      }
    });
  }

  loadTicket(id: number): void {
    this.isLoading = true;
    this.ticketService.getTicketById(id).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.populateForm(ticket);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger le ticket. Veuillez réessayer.';
        this.isLoading = false;
        console.error('Erreur lors du chargement du ticket', err);
      }
    });
  }

  populateForm(ticket: Ticket): void {
    // Load the subgroups based on the ticket's group
    if (ticket.groupeId) {
      this.filterSousGroupes(ticket.groupeId);
    } else if (ticket.groupe?.id) {
      this.filterSousGroupes(ticket.groupe.id);
    }

    // Update form with ticket data
    this.ticketForm.patchValue({
      sujet: ticket.sujet,
      description: ticket.description,
      type: ticket.type,
      urgence: ticket.urgence,
      groupeId: ticket.groupeId || ticket.groupe?.id,
      sousGroupeId: ticket.sousGroupeId || ticket.sousGroupe?.id
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
      // If subgroups aren't loaded yet, load them first
      this.loadSousGroupes(groupeId);
    } else {
      this.filteredSousGroupes = this.sousGroupes.filter(sg => 
        sg.groupe && sg.groupe.id === groupeId
      );
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

    if (!this.ticket || !this.ticketId) {
      this.errorMessage = 'Erreur: Ticket introuvable';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Check if user is logged in
    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'Vous devez être connecté pour modifier un ticket';
      this.isSubmitting = false;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Prepare ticket update data
    const ticketData = {
      ...this.ticketForm.value,
      id: this.ticketId
    };

    // Send request to server via service
    this.ticketService.updateTicket(ticketData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Ticket mis à jour avec succès !';
        
        // Redirect to ticket list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/user/my-tickets']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la mise à jour du ticket. ' + 
                           (error.error?.message || 'Veuillez réessayer.');
        console.error('Erreur lors de la mise à jour du ticket', error);
      }
    });
  }
} 