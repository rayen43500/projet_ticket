package com.example.monpfebackend.Service;

import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Repository.AuthRepository;
import com.example.monpfebackend.Security.JwtTokenUtil;
import com.example.monpfebackend.dto.AuthResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@Service
public class AuthService {

    @Autowired
    private AuthRepository authRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    // Méthode d'inscription avec bcrypt
    public boolean registerUtilisateur(Utilisateur utilisateur) {
        // Vérifier si l'email existe déjà
        if (authRepository.findByEmail(utilisateur.getEmail()) != null) {
            return false; // Échec : utilisateur existe déjà
        }
        
        // S'assurer que le mot de passe est visible dans les logs
        String rawPassword = utilisateur.getPassword();
        System.out.println("Inscription - Mot de passe avant hachage: " + rawPassword);
        
        // Hasher le mot de passe avant de sauvegarder
        String hashedPassword = passwordEncoder.encode(rawPassword);
        utilisateur.setPassword(hashedPassword);
        System.out.println("Inscription - Mot de passe après hachage: " + hashedPassword);
        
        // Pour int@gmail.com, forcer le rôle INTERVENANT
        if (utilisateur.getEmail().equals("int@gmail.com")) {
            utilisateur.setRole(Utilisateur.Role.INTERVENANT);
        }
        
        // Sauvegarder l'utilisateur
        authRepository.save(utilisateur);
        return true; // Succès
    }

    // Méthode pour nettoyer une réponse API récursive
    public Utilisateur cleanUser(Utilisateur user) {
        if (user == null) return null;

        // Créer un nouvel objet utilisateur avec seulement les informations essentielles
        Utilisateur cleanUser = new Utilisateur();
        cleanUser.setId(user.getId());
        cleanUser.setNom(user.getNom());
        cleanUser.setEmail(user.getEmail());
        cleanUser.setRole(user.getRole());
        
        // Si l'utilisateur a un groupe, ajouter les informations basiques du groupe sans les relations
        if (user.getGroupe() != null) {
            Groupe cleanGroupe = new Groupe();
            cleanGroupe.setId(user.getGroupe().getId());
            cleanGroupe.setNom(user.getGroupe().getNom());
            cleanUser.setGroupe(cleanGroupe);
        }
        
        return cleanUser;
    }

    // Méthode de connexion avec JWT
    public AuthResponseDto authenticateUtilisateur(Utilisateur utilisateur) {
        Utilisateur existingUtilisateur = authRepository.findByEmail(utilisateur.getEmail());

        if (existingUtilisateur == null) {
            System.out.println("Email non trouvé: " + utilisateur.getEmail());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email n'existe pas");
        }
        
        // Afficher les données pour le débogage
        System.out.println("Tentative d'authentification pour: " + utilisateur.getEmail());
        System.out.println("Mot de passe fourni (non crypté): " + utilisateur.getPassword());
        System.out.println("Mot de passe en base (crypté): " + existingUtilisateur.getPassword());
        
        boolean passwordMatches = false;
        
        try {
            // Vérifier d'abord avec bcrypt
            passwordMatches = passwordEncoder.matches(utilisateur.getPassword(), existingUtilisateur.getPassword());
            System.out.println("Résultat vérification bcrypt: " + passwordMatches);
            
            // Si bcrypt échoue, vérifier en texte brut (pour les comptes créés avant bcrypt)
            if (!passwordMatches && utilisateur.getPassword().equals(existingUtilisateur.getPassword())) {
                passwordMatches = true;
                System.out.println("Correspondance en texte brut trouvée - mise à jour vers bcrypt");
                
                // Mettre à jour vers bcrypt
                existingUtilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
                authRepository.save(existingUtilisateur);
            }
            
            if (!passwordMatches) {
                System.out.println("Mot de passe incorrect pour: " + utilisateur.getEmail());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe incorrect");
            }
            
            // L'authentification réussit si on arrive ici
            System.out.println("Authentification réussie pour: " + utilisateur.getEmail());
        } catch (Exception e) {
            System.out.println("Erreur d'authentification: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Coordonnées invalides: " + e.getMessage());
        }
        
        // Pour int@gmail.com, forcer le rôle INTERVENANT
        if (existingUtilisateur.getEmail().equals("int@gmail.com")) {
            existingUtilisateur.setRole(Utilisateur.Role.INTERVENANT);
            // Sauvegarder le changement de rôle en base de données
            authRepository.save(existingUtilisateur);
        }
        
        // Vérifier le rôle pour le logging
        System.out.println("Utilisateur authentifié: " + existingUtilisateur.getEmail() + " avec rôle: " + existingUtilisateur.getRole());
        
        // Générer le UserDetails pour créer les tokens
        UserDetails userDetails = createUserDetails(existingUtilisateur);
        
        // Générer les tokens
        String accessToken = jwtTokenUtil.generateToken(userDetails);
        String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
        
        // Créer la réponse d'authentification avec un utilisateur nettoyé
        AuthResponseDto authResponse = new AuthResponseDto();
        authResponse.setUtilisateur(cleanUser(existingUtilisateur));
        authResponse.setToken(accessToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setExpiresIn(86400); // 24 heures en secondes
        
        return authResponse;
    }
    
    // Méthode pour rafraîchir le token
    public AuthResponseDto refreshToken(String refreshToken) {
        try {
            String userEmail = jwtTokenUtil.extractUsername(refreshToken);
            Utilisateur utilisateur = authRepository.findByEmail(userEmail);
            
            if (utilisateur == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé");
            }
            
            UserDetails userDetails = createUserDetails(utilisateur);
            
            if (jwtTokenUtil.isTokenValid(refreshToken, userDetails)) {
                String newAccessToken = jwtTokenUtil.generateToken(userDetails);
                String newRefreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
                
                AuthResponseDto authResponse = new AuthResponseDto();
                authResponse.setUtilisateur(cleanUser(utilisateur));
                authResponse.setToken(newAccessToken);
                authResponse.setRefreshToken(newRefreshToken);
                authResponse.setExpiresIn(86400);
                
                return authResponse;
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalide");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalide");
        }
    }
    
    // Méthode pour vérifier uniquement les identifiants sans générer de token
    public Utilisateur checkCredentials(Utilisateur utilisateur) {
        Utilisateur existingUtilisateur = authRepository.findByEmail(utilisateur.getEmail());

        if (existingUtilisateur == null) {
            System.out.println("Email non trouvé: " + utilisateur.getEmail());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email n'existe pas");
        }
        
        System.out.println("Vérification d'identifiants pour: " + utilisateur.getEmail());
        System.out.println("Mot de passe fourni (non crypté): " + utilisateur.getPassword());
        System.out.println("Mot de passe en base (crypté): " + existingUtilisateur.getPassword());
        
        boolean passwordMatches = false;
        
        // Vérifier avec bcrypt
        try {
            passwordMatches = passwordEncoder.matches(utilisateur.getPassword(), existingUtilisateur.getPassword());
            System.out.println("Résultat vérification bcrypt: " + passwordMatches);
        } catch (Exception e) {
            System.out.println("Erreur vérification bcrypt: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Vérifier en texte brut en dernier recours
        try {
            if (!passwordMatches && utilisateur.getPassword().equals(existingUtilisateur.getPassword())) {
                passwordMatches = true;
                System.out.println("Correspondance en texte brut trouvée");
            }
        } catch (Exception e) {
            System.out.println("Erreur vérification texte brut: " + e.getMessage());
        }
        
        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe incorrect");
        }
        
        System.out.println("Vérification des identifiants réussie pour: " + existingUtilisateur.getEmail());
        return existingUtilisateur;
    }
    
    // Méthode utilitaire pour créer un UserDetails
    private UserDetails createUserDetails(Utilisateur utilisateur) {
        return new User(
            utilisateur.getEmail(),
            utilisateur.getPassword(),
            Collections.emptyList()
        );
    }

    // Ajouter une méthode pour réinitialiser le mot de passe à une valeur connue (utiliser uniquement pour le débogage)
    public boolean resetPassword(String email, String newPassword) {
        Utilisateur utilisateur = authRepository.findByEmail(email);
        if (utilisateur == null) {
            return false;
        }
        
        // Hasher le nouveau mot de passe
        utilisateur.setPassword(passwordEncoder.encode(newPassword));
        authRepository.save(utilisateur);
        System.out.println("Mot de passe réinitialisé pour " + email + " - Nouveau hash: " + utilisateur.getPassword());
        return true;
    }

    // Méthode de test pour le hachage BCrypt
    public String testBcryptEncoding(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}