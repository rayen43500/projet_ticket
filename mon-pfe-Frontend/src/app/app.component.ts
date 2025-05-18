import { Component, OnInit } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'mon-pfe';
  
  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initial loading simulation
    setTimeout(() => {
      this.loadingService.hideLoader();
    }, 1500); // Reduced to 1.5 seconds for better UX
    
    // Show loader on route changes
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
      });
  }
}
