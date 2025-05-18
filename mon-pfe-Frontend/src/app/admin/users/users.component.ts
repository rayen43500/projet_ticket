import { Component, OnInit } from '@angular/core';
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

  // Formulaire de l'utilisateur (pour l'ajout ou la modification)
  userForm: any = {
    id: null,
    email: '',
    nom: '',
    password: '',
    role: ''
  };

  constructor(private usersService: UsersService) {} // Injection du service des utilisateurs

  ngOnInit(): void {
    // Charge tous les utilisateurs au démarrage du composant
    this.getAllUsers();
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
    // Réinitialise le formulaire de l'utilisateur
    this.userForm = { id: null, nom: '', email: '', password: '', role: 'UTILISATEUR' };
  }

  // Ouvre la modale pour modifier un utilisateur existant
  editUser(user: Utilisateur) {
    this.showModal = true;
    this.editingUser = true; // Mode édition
    // Remplir le formulaire avec les données de l'utilisateur sélectionné
    this.userForm = { ...user}; 
  }

  // Enregistre l'utilisateur (ajout ou modification)
  saveUser() {
    // Si en mode édition, mettre à jour l'utilisateur
    if (this.editingUser) {
      this.usersService.updateUser(this.userForm).subscribe(() => {
        this.closeModal(); 
        this.getAllUsers(); 
      });
    } else {
      // Si en mode ajout, ajouter un nouvel utilisateur
      console.log(this.userForm);
      this.usersService.addUser(this.userForm).subscribe(() => {
        this.closeModal();
        this.getAllUsers(); // Recharge la liste des utilisateurs
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
        this.usersService.deleteUser(id).subscribe(() => {
          this.getAllUsers(); // Recharge la liste des utilisateurs
          Swal.fire('Supprimé !', 'L\'utilisateur a été supprimé.', 'success');
        });
      }
    });
  }

  // Ferme la modale sans enregistrer les données
  closeModal() {
    this.showModal = false;
  }
}
