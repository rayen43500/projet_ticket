import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';  
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  user: any; // Contiendra l'utilisateur connecté
  isExpanded = false; // Gère l'état de l'expansion du sidebar
  isLogged = false;  // Indicateur de l'état de connexion

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Combiner les deux observables pour une mise à jour en temps réel
    this.authService.isLoggedIn().subscribe(isLogged => {
      this.isLogged = isLogged;
      
      if (isLogged) {
        this.authService.getCurrentUser().subscribe(user => {
          this.user = user;
          this.isExpanded = false; // Forcer le repli après connexion
        });
      }
    });
  }
  
  // Fonction pour afficher ou masquer la sidebar
  expandSidebar() {
    this.isExpanded = true;
  }

  collapseSidebar() {
    this.isExpanded = false;
  }

  // Fonction pour récupérer le lien du dashboard en fonction du rôle de l'utilisateur
  getDashboardLink(): string {
    if (this.user?.role === 'ADMIN') {
      return '/admin/dashboard';
    } else if (this.user?.role === 'INTERVENANT') {
      return '/intervenant/dashboard';
    } else if (this.user?.role === 'UTILISATEUR') {
      return '/user/dashboard';
    }
    return '/'; // Par défaut, on renvoie à la page d'accueil si le rôle n'est pas reconnu
  }

  // Méthode pour déconnecter l'utilisateur
  logout(): void {
    this.authService.logout();  // Effacer la session de l'utilisateur
    this.router.navigate(['/home']); // Rediriger l'utilisateur vers la page d'accueil
  }
}
