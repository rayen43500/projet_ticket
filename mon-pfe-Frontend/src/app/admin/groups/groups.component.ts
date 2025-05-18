import { Component, OnInit } from '@angular/core';
import { GroupsService, Groupe, Utilisateur } from '../../services/groups.service';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  groupes: Groupe[] = [];
  intervenants: Utilisateur[] = []; // All intervenants (for editing)
  unassignedIntervenants: Utilisateur[] = []; // Only unassigned intervenants (for adding)
  showAddForm = false;
  showEditForm = false;
  selectedGroup: Groupe = { nom: '', intervenants: [] };
  newGroup: Groupe = { nom: '', intervenants: [] };

  constructor(private groupsService: GroupsService) {}

  ngOnInit(): void {
    this.loadAllIntervenants();
    this.loadGroups();
  }

  private loadAllIntervenants(): void {
    // Load all intervenants (for editing existing groups)
    this.groupsService.getIntervenants().subscribe({
      next: (data) => {
        this.intervenants = data;
      },
      error: (err) => {
        this.showErrorToast('Impossible de charger les intervenants', err);
      }
    });
  }

  private loadUnassignedIntervenants(): void {
    // Load unassigned intervenants (for creating new groups)
    this.groupsService.getUnassignedIntervenants().subscribe({
      next: (data) => {
        this.unassignedIntervenants = data;
      },
      error: (err) => {
        this.showErrorToast('Impossible de charger les intervenants non assignés', err);
      }
    });
  }

  // Modifier la méthode loadGroups() pour forcer le rafraîchissement
  private loadGroups(): void {
    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groupes = data;
        console.log('Groupes chargés:', data); // Debug
      },
      error: (err) => {
        this.showErrorToast('Impossible de charger les groupes', err);
      }
    });
  }

  openAddForm(): void {
    // Load unassigned intervenants before opening the form
    this.loadUnassignedIntervenants();
    this.newGroup = { nom: '', intervenants: [] };
    this.showAddForm = true;
  }

  openEditForm(group: Groupe): void {
    this.selectedGroup = { 
      ...group,
      intervenants: group.intervenants.filter(i => 
        this.intervenants.some(intervenant => intervenant.id === i.id)
      )
    };
    this.showEditForm = true;
  }

  submitAddForm(): void {
    // Validation
    if (!this.newGroup.nom.trim()) {
      this.showErrorToast('Veuillez saisir un nom de groupe');
      return;
    }

    if (this.newGroup.intervenants.length === 0) {
      this.showErrorToast('Veuillez sélectionner au moins un intervenant');
      return;
    }

    this.groupsService.createGroup(this.newGroup).subscribe({
      next: (createdGroupe) => {
        console.log('Groupe créé:', createdGroupe); // Debug
        // Reload both groups and intervenants lists
        this.loadGroups();
        this.loadAllIntervenants();
        this.showAddForm = false;
        this.showSuccessToast('Groupe créé avec succès !');
      },
      error: (err) => {
        this.showErrorToast('Erreur lors de la création du groupe', err);
      }
    });
  }

  submitEditForm(): void {
    if (!this.selectedGroup.id) {
      this.showErrorToast('Impossible de modifier ce groupe');
      return;
    }

    // Validation
    if (!this.selectedGroup.nom.trim()) {
      this.showErrorToast('Veuillez saisir un nom de groupe');
      return;
    }

    if (this.selectedGroup.intervenants.length === 0) {
      this.showErrorToast('Veuillez sélectionner au moins un intervenant');
      return;
    }

    this.groupsService.updateGroup(this.selectedGroup.id, this.selectedGroup).subscribe({
      next: () => {
        // Reload both groups and intervenants lists
        this.loadGroups();
        this.loadAllIntervenants();
        this.showEditForm = false;
        this.showSuccessToast('Groupe mis à jour avec succès !');
      },
      error: (err) => {
        this.showErrorToast('Erreur lors de la modification du groupe', err);
      }
    });
  }

  deleteGroup(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      this.groupsService.deleteGroup(id).subscribe({
        next: () => {
          // Reload both groups and intervenants lists
          this.loadGroups();
          this.loadAllIntervenants();
          this.showSuccessToast('Groupe supprimé avec succès !');
        },
        error: (err) => {
          this.showErrorToast('Erreur lors de la suppression du groupe', err);
        }
      });
    }
  }

  toggleIntervenantSelection(intervenant: Utilisateur, isEditForm: boolean = false): void {
    const group = isEditForm ? this.selectedGroup : this.newGroup;
    const index = group.intervenants.findIndex(i => i.id === intervenant.id);
    
    if (index > -1) {
      group.intervenants.splice(index, 1);
    } else {
      group.intervenants.push(intervenant);
    }
  }

  isSelected(intervenant: Utilisateur, isEditForm: boolean = false): boolean {
    const group = isEditForm ? this.selectedGroup : this.newGroup;
    return group.intervenants.some(i => i.id === intervenant.id);
  }

  // ✅ Méthodes de notification
  private showSuccessToast(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private showErrorToast(message: string, error?: any): void {
    // Extract error message from the response if available
    let errorMsg = message;
    let details = '';
    
    if (error) {
      if (error.error && error.error.error) {
        // Use server-side error message if available
        errorMsg = error.error.error;
        details = error.error.details || '';
      } else {
        details = error.message || error.statusText || JSON.stringify(error);
      }
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: errorMsg,
      footer: details ? `<small>Détail : ${details}</small>` : '',
      showConfirmButton: true
    });
  }
}