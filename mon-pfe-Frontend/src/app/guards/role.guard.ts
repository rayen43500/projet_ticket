import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRole = route.data['role'];
    
    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        console.log('RoleGuard - Vérification du rôle:', user?.role, 'email:', user?.email, 'requis:', requiredRole);
        
        // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
        if (!user) {
          console.log('Utilisateur non connecté - redirection vers login');
          this.router.navigate(['/login']);
          return false;
        }
        
        const userRole = user.role.toUpperCase();
        
        // Cas spécial pour int@gmail.com - toujours traité comme INTERVENANT
        if (user.email === 'int@gmail.com' && requiredRole.toUpperCase() === 'INTERVENANT') {
          console.log('Cas spécial int@gmail.com - accès autorisé');
          return true;
        }
        
        // Vérifier si le rôle de l'utilisateur correspond au rôle requis
        if (userRole === requiredRole.toUpperCase()) {
          console.log('Rôle correspondant - accès autorisé');
          return true;
        }
        
        console.log('Rôle non correspondant - redirection vers l\'espace approprié');
        
        // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur
        if (userRole === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'INTERVENANT' || user.email === 'int@gmail.com') {
          this.router.navigate(['/intervenant/dashboard']);
        } else if (userRole === 'UTILISATEUR') {
          this.router.navigate(['/user/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
        
        return false;
      }),
      catchError(err => {
        console.error('Erreur dans RoleGuard:', err);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
} 