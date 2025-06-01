import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';  
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  user: any; // Contiendra l'utilisateur connecté
  isExpanded = true; // Toujours développé par défaut
  isLogged = false;  // Indicateur de l'état de connexion
  screenWidth: number;
  isDashboardPage = false;

  constructor(private authService: AuthService, private router: Router) {
    this.screenWidth = window.innerWidth;
    
    // Vérifier si nous sommes sur une page de dashboard
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isDashboardPage = this.checkIsDashboardPage(event.url);
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    // Sur petits écrans, on ferme automatiquement le sidebar
    if (this.screenWidth <= 992) {
      this.isExpanded = false;
    } else {
      this.isExpanded = true; // Toujours développé sur les grands écrans
    }
    this.adjustContentArea();
  }

  ngOnInit(): void {
    // Initialiser l'état développé sur les grands écrans
    this.isExpanded = this.screenWidth > 992;
    
    // Combiner les deux observables pour une mise à jour en temps réel
    this.authService.isLoggedIn().subscribe(isLogged => {
      this.isLogged = isLogged;
      
      if (isLogged) {
        this.authService.getCurrentUser().subscribe(user => {
          this.user = user;
          this.adjustContentArea(); // Ajuster le contenu après connexion
        });
      }
    });

    // Assurer que le contenu s'ajuste correctement lors de l'initialisation
    setTimeout(() => {
      this.adjustContentArea();
    }, 100);
  }
  
  // Sur grands écrans, ces méthodes ne font rien puisque le sidebar est toujours développé
  expandSidebar() {
    if (this.screenWidth <= 992) {
      this.isExpanded = true;
      this.adjustContentArea();
    }
  }

  collapseSidebar() {
    if (this.screenWidth <= 992) {
      this.isExpanded = false;
      this.adjustContentArea();
    }
  }

  // Ajuster la zone de contenu en fonction de l'état de la sidebar
  adjustContentArea() {
    const contentArea = document.querySelector('.content-area') as HTMLElement;
    if (contentArea) {
      if (this.isExpanded) {
        contentArea.style.marginLeft = this.screenWidth <= 992 ? '10px' : '270px';
      } else {
        contentArea.style.marginLeft = this.screenWidth <= 992 ? '10px' : '70px';
      }
    }
  }

  // Vérifie si l'URL actuelle est une page de dashboard
  checkIsDashboardPage(url: string): boolean {
    return url.includes('/dashboard') || 
           url.includes('/admin/') || 
           url.includes('/user/') || 
           url.includes('/intervenant/') || 
           url.includes('/statistics/');
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
