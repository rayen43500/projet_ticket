package com.example.monpfebackend.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, JwtAuthEntryPoint jwtAuthEntryPoint, UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.jwtAuthEntryPoint = jwtAuthEntryPoint;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Points d'accès publics (pas besoin d'authentification)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                
                // Temporairement autoriser tous les endpoints de tickets pour dépannage
                .requestMatchers("/api/tickets/**").permitAll()
                
                // Points d'accès spécifiques aux intervenants - commentés pour le dépannage
                //.requestMatchers("/api/tickets/intervenant/**").hasAnyRole("INTERVENANT", "ADMIN")
                //.requestMatchers(HttpMethod.PATCH, "/api/tickets/*/assign").hasAnyRole("INTERVENANT", "ADMIN")
                //.requestMatchers(HttpMethod.PATCH, "/api/tickets/*/statut").hasAnyRole("INTERVENANT", "ADMIN")
                
                // Tout le reste nécessite une authentification - temporairement désactivé
                .anyRequest().permitAll()
                //.anyRequest().authenticated()
            );
        
        // Ajouter notre filtre JWT avant le filtre d'authentification standard
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        System.out.println("⚡ Configuration de sécurité chargée - MODE DÉPANNAGE");
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Autoriser l'origine spécifique
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        // Autoriser toutes les méthodes HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Autoriser tous les en-têtes
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        // Autoriser l'envoi de cookies pour l'authentification
        configuration.setAllowCredentials(true);
        // Exposer l'en-tête Authorization
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        // Ajouter une durée de mise en cache
        configuration.setMaxAge(3600L);
        
        System.out.println("🔄 Configuration CORS mise à jour: http://localhost:4200 avec credentials autorisés");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth, PasswordEncoder passwordEncoder) throws Exception {
        auth.userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder);
        System.out.println("🔒 UserDetailsService et PasswordEncoder configurés");
    }
} 