import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLogged = false;
  currentUser: any = null;
  navbarOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn().subscribe(isLogged => {
      this.isLogged = isLogged;
      
      // If user is logged in, get their details
      if (isLogged) {
        this.authService.getCurrentUser().subscribe(user => {
          this.currentUser = user;
        });
      } else {
        this.currentUser = null;
      }
    });
  }
  
  // Toggle navbar for mobile view
  toggleNavbar(): void {
    this.navbarOpen = !this.navbarOpen;
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
