package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.Utilisateur;

public class UtilisateurDto {
    private Long id;
    private String nom;
    private String email;
    private String role;
    private GroupeSimpleDto groupe;

    public UtilisateurDto(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.nom = utilisateur.getNom();
        this.email = utilisateur.getEmail();
        this.role = utilisateur.getRole().name();
        
        if (utilisateur.getGroupe() != null) {
            this.groupe = new GroupeSimpleDto(utilisateur.getGroupe().getId(), utilisateur.getGroupe().getNom());
        }
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public GroupeSimpleDto getGroupe() {
        return groupe;
    }

    // Simple DTO for Groupe without circular references
    public static class GroupeSimpleDto {
        private Long id;
        private String nom;

        public GroupeSimpleDto(Long id, String nom) {
            this.id = id;
            this.nom = nom;
        }

        public Long getId() {
            return id;
        }

        public String getNom() {
            return nom;
        }
    }
} 