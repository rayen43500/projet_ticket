package com.example.monpfebackend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Groupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    // Un groupe peut avoir plusieurs intervenants
    @OneToMany(mappedBy = "groupe",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            fetch = FetchType.LAZY)
    @JsonIgnoreProperties("groupe")
    private List<Utilisateur> intervenants = new ArrayList<>();

    // Un groupe peut avoir plusieurs sous-groupes
    @OneToMany(mappedBy = "groupe",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<SousGroupe> sousGroupes = new ArrayList<>();

    // Un groupe peut avoir plusieurs tickets
    @OneToMany(mappedBy = "groupe",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<Ticket> tickets = new ArrayList<>();

    // Constructeurs
    public Groupe() {}

    public Groupe(String nom) {
        this.nom = nom;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public List<Utilisateur> getIntervenants() {
        return intervenants;
    }

    public void setIntervenants(List<Utilisateur> intervenants) {
        this.intervenants = intervenants;

        // Mettre à jour la relation inverse
        for (Utilisateur utilisateur : intervenants) {
            utilisateur.setGroupe(this);
        }
    }

    public List<SousGroupe> getSousGroupes() {
        return sousGroupes;
    }

    public void setSousGroupes(List<SousGroupe> sousGroupes) {
        this.sousGroupes = sousGroupes;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }
}
