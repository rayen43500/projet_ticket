package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.SousGroupe;

public class SousGroupeDto {
    private Long id;
    private String nom;
    private GroupeSimpleDto groupe;

    public SousGroupeDto(SousGroupe sousGroupe) {
        this.id = sousGroupe.getId();
        this.nom = sousGroupe.getNom();
        if (sousGroupe.getGroupe() != null) {
            this.groupe = new GroupeSimpleDto(sousGroupe.getGroupe().getId(), sousGroupe.getGroupe().getNom());
        }
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
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