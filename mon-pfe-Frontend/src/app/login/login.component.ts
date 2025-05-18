import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
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
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
      password: ['', Validators.required]
    });
  }

  // Getter pratique pour accéder facilement aux champs du formulaire
  get f() {
    return this.loginForm.controls;
  }

  // Validator pour une adresse Gmail
  gmailValidator(control: any) {
    const email = control.value;
    if (email && !email.endsWith('@gmail.com')) {
      return { notGmail: true };
    }
    return null;
  }

  //Contrôle d'affichage du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement le formulaire';
      setTimeout(() => this.errorMessage = null, 2000);
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
          this.errorMessage = 'Réponse du serveur incomplète';
          setTimeout(() => this.errorMessage = null, 2000);
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
      error: (err) => {
        console.error('Erreur de connexion:', err);
        
        // Gestion des erreurs améliorée
        if (err.status === 401) {
          this.errorMessage = 'Mot de passe incorrect';
        } else if (err.status === 404) {
          this.errorMessage = 'Email non enregistré';
        } else if (err.error && err.error.message) {
          // Si le serveur renvoie un message spécifique
          this.errorMessage = err.error.message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Erreur de connexion, veuillez réessayer';
        }

        // Ne pas réinitialiser tout le formulaire, juste le mot de passe
        this.loginForm.get('password')?.reset();
        
        // Disparait après 2 secondes
        setTimeout(() => this.errorMessage = null, 2000); 
      }  
    });
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
