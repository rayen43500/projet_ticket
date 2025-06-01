import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Champs liés au formulaire
  loginForm!: FormGroup;
  showPassword: boolean = false;
  errorMessage: string | null = null;
  isPasswordFocused: boolean = false; 
  errorType: 'email' | 'password' | 'server' | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si un utilisateur est déjà connecté
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.redirectBasedOnRole();
      }
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      password: ['', Validators.required]
    });
  }

  // Getter pratique pour accéder facilement aux champs du formulaire
  get f() {
    return this.loginForm.controls;
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

  //Contrôle d'affichage du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Réinitialiser les messages d'erreur
    this.errorMessage = null;
    this.errorType = null;

    if (this.loginForm.invalid) {
      if (this.f['email'].invalid) {
        this.errorMessage = 'Veuillez entrer une adresse email valide';
        this.errorType = 'email';
      } else if (this.f['password'].invalid) {
        this.errorMessage = 'Veuillez entrer votre mot de passe';
        this.errorType = 'password';
      } else {
        this.errorMessage = 'Veuillez remplir correctement le formulaire';
        this.errorType = 'server';
      }
      return;
    }

    const utilisateur = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    this.authService.login(utilisateur).subscribe({
      next: (response) => {
        // Vérifier si la réponse contient les données nécessaires
        if (!response || !response.utilisateur || !response.token) {
          this.handleError({
            message: 'Réponse du serveur incomplète',
            type: 'server'
          });
          return;
        }

        // Message de succès
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie 🎉',
          showConfirmButton: false,
          timer: 1500
        });  
        
        // La redirection est gérée automatiquement par le AuthService
        this.redirectBasedOnRole();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur de connexion:', err);
        this.handleApiError(err);
      }  
    });
  }

  // Gestion des erreurs de l'API
  private handleApiError(err: HttpErrorResponse): void {
    // Ne pas réinitialiser tout le formulaire, juste le mot de passe
    this.loginForm.get('password')?.reset();
    
    if (err.status === 401) {
      this.handleError({
        message: 'Mot de passe incorrect',
        type: 'password'
      });
    } else if (err.status === 404) {
      this.handleError({
        message: 'Email non enregistré',
        type: 'email'
      });
    } else if (err.status === 429) {
      this.handleError({
        message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
        type: 'server'
      });
    } else if (err.status === 403) {
      this.handleError({
        message: 'Votre compte a été temporairement bloqué pour des raisons de sécurité.',
        type: 'server'
      });
    } else if (err.error && err.error.message) {
      // Traiter les messages d'erreur personnalisés du backend
      const backendMessage = err.error.message;
      
      if (backendMessage.includes('mot de passe') || backendMessage.includes('password')) {
        this.handleError({
          message: backendMessage,
          type: 'password'
        });
      } else if (backendMessage.includes('email') || backendMessage.includes('utilisateur')) {
        this.handleError({
          message: backendMessage,
          type: 'email'
        });
      } else {
        this.handleError({
          message: backendMessage,
          type: 'server'
        });
      }
    } else {
      this.handleError({
        message: 'Erreur de connexion, veuillez réessayer',
        type: 'server'
      });
    }
  }

  // Gestion des erreurs avec type
  private handleError(error: { message: string, type: 'email' | 'password' | 'server' }): void {
    this.errorMessage = error.message;
    this.errorType = error.type;
    
    // Disparait après 5 secondes
    setTimeout(() => {
      this.errorMessage = null;
      this.errorType = null;
    }, 5000);
  }

  // Fonction pour rediriger l'utilisateur selon son rôle
  redirectBasedOnRole(): void {
    this.authService.getUserRole().subscribe(role => {
      const roleUpper = role ? role.toUpperCase() : '';
      
      if (roleUpper === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } 
      else if (roleUpper === 'INTERVENANT') {
        this.router.navigate(['/intervenant/dashboard']);
      } 
      else if (roleUpper === 'UTILISATEUR') {
        this.router.navigate(['/user/dashboard']);
      } 
      else {
        this.router.navigate(['/home']);
      }
    });
  }
}
