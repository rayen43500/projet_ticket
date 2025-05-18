import { Component, OnInit } from '@angular/core';
import { AuthService, Utilisateur } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Importer le service Router
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
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    this.registerForm.get('password')?.valueChanges.subscribe((value: string) => {
      this.checkPasswordStrength(value);
    });
  }

  // Validator pour une adresse Gmail
  gmailValidator(control: any) {
    const email = control.value;
    if (email && !email.endsWith('@gmail.com')) {
      return { notGmail: true };
    }
    return null;
  }

  // Vérification de la force du mot de passe
  checkPasswordStrength(password: string) {
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

  // Fonction de soumission du formulaire
  onSubmit(): void {
    this.isSubmitted = true;
    if (this.registerForm.invalid || this.passwordStrengthLevel === 'weak' || this.passwordStrengthLevel === 'empty') return;

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
          Swal.fire({
            icon: 'error',
            title: 'Oops... Une erreur est survenue!',
            showConfirmButton: false,
            timer: 2000
          });
        }
      },
      error: (err) => {
        // Si erreur de duplicata d'email
        if (err.status === 400 && err.error && err.error.message === "Email already exists") {
          Swal.fire({
            icon: 'error',
            title: 'Oops... Cet email est déjà utilisé!',
            showConfirmButton: false,
            timer: 2000
          });
          this.registerForm.get('email')?.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops... Une erreur est survenue!',
            text: err.message || 'Veuillez réessayer plus tard',
            showConfirmButton: false,
            timer: 3000
          });
        }
      }
    });
  }
}
