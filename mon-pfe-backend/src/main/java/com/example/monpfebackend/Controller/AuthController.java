package com.example.monpfebackend.Controller;

import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Service.AuthService;
import com.example.monpfebackend.dto.AuthResponseDto;
import com.example.monpfebackend.dto.RefreshTokenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Préfixe commun
@CrossOrigin(origins = "http://localhost:4200") // Autoriser Angular à communiquer avec le backend
public class AuthController {

    @Autowired
    private AuthService authService;

    // Endpoint pour l'inscription
    @PostMapping("/register")
    public ResponseEntity<Boolean> registerUtilisateur(@RequestBody Utilisateur utilisateur) {
        boolean success = authService.registerUtilisateur(utilisateur);
        return ResponseEntity.ok(success); // Retourne true/false avec status 200
    }

    // Endpoint pour la connexion
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody Utilisateur utilisateur) {
        try {
            System.out.println("🔑 Demande de connexion reçue pour: " + utilisateur.getEmail());
            AuthResponseDto response = authService.authenticateUtilisateur(utilisateur);
            System.out.println("✅ Authentification réussie, envoi de la réponse JWT");
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            // Log de l'erreur pour debugging
            System.out.println("❌ Erreur d'authentification: " + ex.getMessage() + " pour l'email: " + utilisateur.getEmail());
            System.out.println("🔒 Code de statut: " + ex.getStatusCode());
            return ResponseEntity.status(ex.getStatusCode())
                    .body(new AuthResponseDto(null, null, null, 0)); // Réponse vide mais pas null
        } catch (Exception ex) {
            // Log de l'erreur non prévue pour debugging
            System.out.println("❌ Erreur inattendue: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto(null, null, null, 0)); // Réponse vide mais pas null
        }
    }
    
    // Endpoint pour rafraîchir le token
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseDto> refreshToken(@RequestBody RefreshTokenRequest refreshRequest) {
        try {
            System.out.println("🔄 Demande de rafraîchissement de token reçue");
            AuthResponseDto response = authService.refreshToken(refreshRequest.getRefreshToken());
            System.out.println("✅ Token rafraîchi avec succès");
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            System.out.println("❌ Erreur de rafraîchissement: " + ex.getMessage());
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }
    
    // Endpoint de diagnostic pour vérifier l'authentification actuelle
    @GetMapping("/check-auth")
    public ResponseEntity<Map<String, Object>> checkAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (auth != null && auth.isAuthenticated()) {
            response.put("authenticated", true);
            response.put("principal", auth.getPrincipal());
            response.put("authorities", auth.getAuthorities());
            response.put("details", auth.getDetails());
            System.out.println("✅ Vérification d'authentification: Utilisateur authentifié");
            return ResponseEntity.ok(response);
        } else {
            response.put("authenticated", false);
            System.out.println("❌ Vérification d'authentification: Non authentifié");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    // Endpoint de diagnostic pour vérifier les identifiants
    @PostMapping("/check-credentials")
    public ResponseEntity<Map<String, Object>> checkCredentials(@RequestBody Utilisateur utilisateur) {
        try {
            System.out.println("🔍 Vérification des identifiants pour: " + utilisateur.getEmail());
            Utilisateur checkedUser = authService.checkCredentials(utilisateur);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Identifiants valides");
            response.put("role", checkedUser.getRole());
            response.put("email", checkedUser.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", ex.getMessage());
            response.put("status", ex.getStatusCode());
            
            return ResponseEntity.status(ex.getStatusCode()).body(response);
        }
    }

    // Endpoint de test pour vérifier le hachage BCrypt
    @GetMapping("/test-bcrypt")
    public ResponseEntity<String> testBcrypt(@RequestParam String rawPassword) {
        try {
            // Utilisez le même encoder que celui utilisé pour l'authentification
            String encodedPassword = authService.testBcryptEncoding(rawPassword);
            return ResponseEntity.ok("Mot de passe original: " + rawPassword + 
                                     "\nMot de passe haché: " + encodedPassword);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du hachage: " + ex.getMessage());
        }
    }
    
    // Endpoint pour réinitialiser un mot de passe (utilisé pour le débogage)
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam String email, 
            @RequestParam String newPassword) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean success = authService.resetPassword(email, newPassword);
            response.put("success", success);
            if (success) {
                response.put("message", "Mot de passe réinitialisé pour " + email);
            } else {
                response.put("message", "Utilisateur non trouvé: " + email);
            }
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", "Erreur: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}