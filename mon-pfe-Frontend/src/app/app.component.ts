import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'mon-pfe';
  isHomePage = false;
  
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {
    // Détecter si nous sommes sur la page d'accueil
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.url === '/home' || event.url === '/';
      }
    });
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.loadingService.showLoader();
        } else {
          setTimeout(() => {
            this.loadingService.hideLoader();
          }, 300); // Small delay to ensure smooth transitions
        }
        
        // Mettre à jour l'état de la page d'accueil
        if (event instanceof NavigationEnd) {
          this.isHomePage = event.url === '/home' || event.url === '/';
        }
      });
  }

  ngAfterViewInit() {
    // Assurer que le content area s'ajuste correctement après le chargement de la page
    setTimeout(() => {
      if (this.sidebar && !this.isHomePage) {
        this.sidebar.adjustContentArea();
      }
    }, 100);
  }
}
