import { Component, OnInit } from '@angular/core';
import { AuthService, Utilisateur } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  // Déclaration des propriétés utilisées dans le formulaire
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword = false;
  showConfirmPassword = false;
  registerForm!: FormGroup;
  isSubmitted = false;
  isPasswordFocused = false;
  passwordStrengthMessage: string = '';
  passwordStrengthLevel: 'weak' | 'medium' | 'strong' | 'empty' = 'empty';
  
  // Propriétés pour la gestion des erreurs
  errorMessage: string | null = null;
  errorType: 'fullName' | 'email' | 'password' | 'confirmPassword' | 'server' | null = null;

  // Injection des services nécessaires (authService et router)
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router // Injecter le service Router
  ) {}

  // Fonctions pour basculer l'affichage du mot de passe & la confirmation 
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Initialisation du formulaire et abonnir à la modification de mot de passe
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    this.registerForm.get('password')?.valueChanges.subscribe((value: string) => {
      this.checkPasswordStrength(value);
    });
    
    // Réinitialiser les erreurs lorsque les champs sont modifiés
    this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = null;
        this.errorType = null;
      }
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

  // Vérification de la force du mot de passe
  checkPasswordStrength(password: string) {
    if (!password || password.length === 0) {
      this.passwordStrengthLevel = 'empty';
      this.passwordStrengthMessage = '';
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (password.length < 6 || (!hasUpperCase && !hasNumber && !hasSpecialChar)) {
      this.passwordStrengthMessage = 'Faible';
      this.passwordStrengthLevel = 'weak';
    } else if (password.length >= 6 && (hasUpperCase || hasNumber || hasSpecialChar)) {
      this.passwordStrengthMessage = 'Moyen';
      this.passwordStrengthLevel = 'medium';
    }

    if (password.length >= 8 && hasUpperCase && hasNumber && hasSpecialChar) {
      this.passwordStrengthMessage = 'Fort';
      this.passwordStrengthLevel = 'strong';
    }
  }

  // Validator pour vérifier si les mots de passe sont identiques
  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { passwordsMismatch: true };
  }

  // Accès aux contrôles du formulaire
  get f() {
    return this.registerForm.controls;
  }

  // Méthode pour savoir si on peut activer le bouton d'envoi
  canSubmit(): boolean {
    return (
      this.registerForm.valid &&
      (this.passwordStrengthLevel === 'medium' || this.passwordStrengthLevel === 'strong')
    );
  }

  // Gestion des erreurs avec type
  private handleError(error: { message: string, type: 'fullName' | 'email' | 'password' | 'confirmPassword' | 'server' }): void {
    this.errorMessage = error.message;
    this.errorType = error.type;
    
    // Disparait après 5 secondes pour les erreurs serveur
    if (error.type === 'server') {
      setTimeout(() => {
        this.errorMessage = null;
        this.errorType = null;
      }, 5000);
    }
  }

  // Gestion des erreurs de l'API
  private handleApiError(err: HttpErrorResponse): void {
    if (err.status === 400) {
      if (err.error && err.error.message === "Email already exists") {
        this.handleError({
          message: 'Cet email est déjà utilisé',
          type: 'email'
        });
        this.registerForm.get('email')?.setErrors({ emailExists: true });
      } else if (err.error && err.error.message) {
        // Traiter les messages d'erreur personnalisés du backend
        const backendMessage = err.error.message;
        
        if (backendMessage.includes('mot de passe') || backendMessage.includes('password')) {
          this.handleError({
            message: backendMessage,
            type: 'password'
          });
        } else if (backendMessage.includes('email')) {
          this.handleError({
            message: backendMessage,
            type: 'email'
          });
        } else if (backendMessage.includes('nom') || backendMessage.includes('name')) {
          this.handleError({
            message: backendMessage,
            type: 'fullName'
          });
        } else {
          this.handleError({
            message: backendMessage,
            type: 'server'
          });
        }
      }
    } else if (err.status === 409) {
      this.handleError({
        message: 'Cet email est déjà utilisé',
        type: 'email'
      });
      this.registerForm.get('email')?.setErrors({ emailExists: true });
    } else {
      this.handleError({
        message: 'Une erreur est survenue lors de l\'inscription',
        type: 'server'
      });
    }
  }

  // Fonction de soumission du formulaire
  onSubmit(): void {
    // Réinitialiser les messages d'erreur
    this.errorMessage = null;
    this.errorType = null;
    
    this.isSubmitted = true;
    
    if (this.registerForm.invalid) {
      if (this.f['fullName'].invalid) {
        this.handleError({
          message: 'Veuillez entrer votre nom complet',
          type: 'fullName'
        });
        return;
      } else if (this.f['email'].invalid) {
        this.handleError({
          message: 'Veuillez entrer une adresse email valide',
          type: 'email'
        });
        return;
      } else if (this.f['password'].invalid) {
        this.handleError({
          message: 'Le mot de passe doit contenir au moins 6 caractères',
          type: 'password'
        });
        return;
      } else if (this.f['confirmPassword'].invalid || this.registerForm.errors?.['passwordsMismatch']) {
        this.handleError({
          message: 'Les mots de passe ne correspondent pas',
          type: 'confirmPassword'
        });
        return;
      }
      return;
    }

    if (this.passwordStrengthLevel === 'weak' || this.passwordStrengthLevel === 'empty') {
      this.handleError({
        message: 'Votre mot de passe est trop faible',
        type: 'password'
      });
      return;
    }

    const utilisateur: Utilisateur = {
      nom: this.f['fullName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      role: 'UTILISATEUR'
    };

    this.authService.register(utilisateur).subscribe({
      next: (response: any) => {
        if (response === true || (response && response.token)) {
          Swal.fire({
            icon: 'success',
            title: 'Inscription réussie 🎉',
            showConfirmButton: false,
            timer: 2000
          });
          this.router.navigate(['/login']);
        } else {
          this.handleError({
            message: 'Une erreur est survenue lors de l\'inscription',
            type: 'server'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.handleApiError(err);
      }
    });
  }
}
