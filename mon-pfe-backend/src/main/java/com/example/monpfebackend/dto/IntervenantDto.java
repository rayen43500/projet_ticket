package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.Utilisateur;

public class IntervenantDto {
    private Long id;
    private String nom;
    private String email;

    public IntervenantDto(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.nom = utilisateur.getNom();
        this.email = utilisateur.getEmail();
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getEmail() {
        return email;
    }
}
