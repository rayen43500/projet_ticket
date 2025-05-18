package com.example.monpfebackend.Security;

import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Repository.AuthRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AuthRepository authRepository;

    public UserDetailsServiceImpl(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = authRepository.findByEmail(email);
        
        if (utilisateur == null) {
            System.err.println("❌ Utilisateur non trouvé avec l'email: " + email);
            throw new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + email);
        }
        
        // Appliquer une règle spéciale pour int@gmail.com
        String role = "ROLE_" + utilisateur.getRole().toString();
        
        // Forcer le rôle INTERVENANT pour int@gmail.com
        if (utilisateur.getEmail().equals("int@gmail.com")) {
            role = "ROLE_INTERVENANT";
            System.out.println("✅ Rôle INTERVENANT attribué à int@gmail.com");
        }
        
        System.out.println("🔑 Chargement utilisateur: " + email + " avec rôle: " + role);
        System.out.println("🔒 Mot de passe (hashé): " + utilisateur.getPassword());
        
        return new User(
                utilisateur.getEmail(),
                utilisateur.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }
} 