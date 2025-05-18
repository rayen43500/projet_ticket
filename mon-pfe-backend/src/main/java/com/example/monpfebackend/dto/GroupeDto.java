package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.Groupe;

import java.util.List;
import java.util.stream.Collectors;

public class GroupeDto {
    private Long id;
    private String nom;
    private List<IntervenantDto> intervenants;

    public GroupeDto(Groupe groupe) {
        this.id = groupe.getId();
        this.nom = groupe.getNom();
        this.intervenants = groupe.getIntervenants()
                .stream()
                .map(IntervenantDto::new)
                .collect(Collectors.toList());
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public List<IntervenantDto> getIntervenants() {
        return intervenants;
    }
}
