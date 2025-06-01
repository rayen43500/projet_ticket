import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsersService, Utilisateur } from 'src/app/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  // Liste des utilisateurs
  users: Utilisateur[] = [];

  // Liste des utilisateurs filtrés
  filteredUsers: Utilisateur[] = [];

  // Terme de recherche pour filtrer les utilisateurs
  searchTerm = '';

  // Rôle sélectionné pour filtrer les utilisateurs
  selectedRole = '';

  // Liste des rôles disponibles
  roles = ['ADMIN', 'INTERVENANT', 'UTILISATEUR'];

  showModal = false;

  // Détermine si l'utilisateur est en mode édition ou ajout
  editingUser: boolean = false;

  // Formulaire réactif pour la validation
  userForm!: FormGroup;
  
  // Indique si le formulaire a été soumis pour afficher les erreurs
  submitted = false;

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Charge tous les utilisateurs au démarrage du composant
    this.getAllUsers();
    // Initialiser le formulaire
    this.initForm();
  }

  // Initialiser le formulaire avec validation
  initForm() {
    this.userForm = this.fb.group({
      id: [null],
      nom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['UTILISATEUR', Validators.required]
    });
  }

  // Validator pour une adresse email avec regex
  emailValidator(control: any) {
    const email = control.value;
    if (!email) return null;
    
    // Regex pour valider les adresses email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    return null;
  }

  // Getter pour accéder facilement aux contrôles du formulaire
  get f() {
    return this.userForm.controls;
  }

  // Récupère tous les utilisateurs depuis le service
  getAllUsers() {
    this.usersService.getAllUsers().subscribe((data: Utilisateur[]) => {
      this.users = data;
      this.filteredUsers = data;
    });
  }

  // Filtre les utilisateurs en fonction du terme de recherche
  searchUsers() {
    this.filteredUsers = this.users.filter(u =>
      u.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Filtre les utilisateurs en fonction du rôle sélectionné
  filterByRole() {
    this.filteredUsers = this.selectedRole ?
      this.users.filter(u => u.role === this.selectedRole) : this.users;
  }

  // Ouvre la modale pour ajouter un nouvel utilisateur
  openAddUserModal() {
    this.showModal = true;
    this.editingUser = false;  // Mode ajout
    this.submitted = false;
    // Réinitialiser le formulaire
    this.userForm.reset({
      id: null,
      nom: '',
      email: '',
      password: '',
      role: 'UTILISATEUR'
    });
    // Rendre le mot de passe obligatoire pour un nouvel utilisateur
    this.f['password'].setValidators([Validators.required, Validators.minLength(6)]);
    this.f['password'].updateValueAndValidity();
  }

  // Ouvre la modale pour modifier un utilisateur existant
  editUser(user: Utilisateur) {
    this.showModal = true;
    this.editingUser = true; // Mode édition
    this.submitted = false;
    
    // Remplir le formulaire avec les données de l'utilisateur sélectionné
    this.userForm.patchValue({
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role
    });
    
    // Le mot de passe n'est pas obligatoire en mode édition
    this.f['password'].clearValidators();
    this.f['password'].updateValueAndValidity();
  }

  // Enregistre l'utilisateur (ajout ou modification)
  saveUser() {
    this.submitted = true;
    
    // Vérifier si le formulaire est valide
    if (this.userForm.invalid) {
      return;
    }
    
    // Si en mode édition, mettre à jour l'utilisateur
    if (this.editingUser) {
      this.usersService.updateUser(this.userForm.value).subscribe({
        next: () => {
          this.closeModal(); 
          this.getAllUsers();
          Swal.fire({
            icon: 'success',
            title: 'Utilisateur modifié avec succès',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Une erreur est survenue lors de la modification',
          });
        }
      });
    } else {
      // Si en mode ajout, ajouter un nouvel utilisateur
      this.usersService.addUser(this.userForm.value).subscribe({
        next: () => {
          this.closeModal();
          this.getAllUsers(); // Recharge la liste des utilisateurs
          Swal.fire({
            icon: 'success',
            title: 'Utilisateur ajouté avec succès',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Une erreur est survenue lors de l\'ajout',
          });
        }
      });
    }
  }

  // Confirme la suppression d'un utilisateur
  confirmDelete(id: number) {
    // Affiche une alerte de confirmation avant de supprimer l'utilisateur
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, supprimer l'utilisateur via le service
        this.usersService.deleteUser(id).subscribe({
          next: () => {
            this.getAllUsers(); // Recharge la liste des utilisateurs
            Swal.fire('Supprimé !', 'L\'utilisateur a été supprimé.', 'success');
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: err.error?.message || 'Une erreur est survenue lors de la suppression',
            });
          }
        });
      }
    });
  }

  // Ferme la modale sans enregistrer les données
  closeModal() {
    this.showModal = false;
    this.submitted = false;
  }
}
