import { Component, OnInit } from '@angular/core';
import { SubgroupsService } from '../../services/subgroups.service';
import { GroupsService } from '../../services/groups.service';
import { SousGroupe } from '../../models/sous-groupe.model';
import { Groupe } from '../../models/groupe.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subgroups',
  templateUrl: './subgroups.component.html',
  styleUrls: ['./subgroups.component.css']
})
export class SubgroupsComponent implements OnInit {
  sousGroupes: SousGroupe[] = [];
  groupes: Groupe[] = [];
  filteredSousGroupes: SousGroupe[] = [];
  selectedGroupeId: number | null = null;
  
  showAddModal = false;
  showEditModal = false;
  
  newSousGroupe: SousGroupe = {
    nom: '',
    groupe: { id: 0 }
  };
  
  selectedSousGroupe: SousGroupe = {
    nom: '',
    groupe: { id: 0 }
  };

  constructor(
    private subgroupsService: SubgroupsService,
    private groupsService: GroupsService
  ) {}

  ngOnInit(): void {
    this.loadGroupes();
    this.loadAllSousGroupes();
  }

  loadGroupes(): void {
    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groupes = data;
      },
      error: (err) => {
        this.showErrorToast('Impossible de charger les groupes', err);
      }
    });
  }

  loadAllSousGroupes(): void {
    this.subgroupsService.getAll().subscribe({
      next: (data) => {
        this.sousGroupes = data;
        this.filteredSousGroupes = data;
      },
      error: (err) => {
        this.showErrorToast('Impossible de charger les sous-groupes', err);
      }
    });
  }

  filterByGroupe(): void {
    if (this.selectedGroupeId) {
      this.subgroupsService.getByGroup(this.selectedGroupeId).subscribe({
        next: (data) => {
          this.filteredSousGroupes = data;
        },
        error: (err) => {
          this.showErrorToast('Erreur lors du filtrage des sous-groupes', err);
        }
      });
    } else {
      this.filteredSousGroupes = this.sousGroupes;
    }
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newSousGroupe = {
      nom: '',
      groupe: { id: this.selectedGroupeId || 0 }
    };
  }

  openEditModal(sousGroupe: SousGroupe): void {
    this.showEditModal = true;
    this.selectedSousGroupe = { ...sousGroupe };
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
  }

  addSousGroupe(): void {
    if (!this.newSousGroupe.nom.trim()) {
      this.showErrorToast('Veuillez saisir un nom pour le sous-groupe');
      return;
    }

    if (!this.newSousGroupe.groupe?.id) {
      this.showErrorToast('Veuillez sélectionner un groupe parent');
      return;
    }

    this.subgroupsService.create(this.newSousGroupe).subscribe({
      next: () => {
        this.loadAllSousGroupes();
        this.closeModals();
        this.showSuccessToast('Sous-groupe créé avec succès');
      },
      error: (err) => {
        this.showErrorToast('Erreur lors de la création du sous-groupe', err);
      }
    });
  }

  updateSousGroupe(): void {
    if (!this.selectedSousGroupe.id) {
      this.showErrorToast('ID du sous-groupe manquant');
      return;
    }

    if (!this.selectedSousGroupe.nom.trim()) {
      this.showErrorToast('Veuillez saisir un nom pour le sous-groupe');
      return;
    }

    if (!this.selectedSousGroupe.groupe?.id) {
      this.showErrorToast('Veuillez sélectionner un groupe parent');
      return;
    }

    this.subgroupsService.update(this.selectedSousGroupe.id, this.selectedSousGroupe).subscribe({
      next: () => {
        this.loadAllSousGroupes();
        this.closeModals();
        this.showSuccessToast('Sous-groupe mis à jour avec succès');
      },
      error: (err) => {
        this.showErrorToast('Erreur lors de la mise à jour du sous-groupe', err);
      }
    });
  }

  deleteSousGroupe(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subgroupsService.delete(id).subscribe({
          next: () => {
            this.loadAllSousGroupes();
            this.showSuccessToast('Sous-groupe supprimé avec succès');
          },
          error: (err) => {
            this.showErrorToast('Erreur lors de la suppression du sous-groupe', err);
          }
        });
      }
    });
  }

  getGroupeName(groupeId: number | undefined): string {
    if (!groupeId) return 'Non assigné';
    const groupe = this.groupes.find(g => g.id === groupeId);
    return groupe ? groupe.nom : 'Groupe inconnu';
  }

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
