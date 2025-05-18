package com.example.monpfebackend.Entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class SousGroupe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    // Chaque sous-groupe appartient à un groupe
    @ManyToOne
    @JoinColumn(name = "groupe_id", nullable = false)
    private Groupe groupe;

    // Un sous-groupe peut avoir plusieurs tickets
    @OneToMany(mappedBy = "sousGroupe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ticket> tickets;

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

    public Groupe getGroupe() {
        return groupe;
    }

    public void setGroupe(Groupe groupe) {
        this.groupe = groupe;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }
}
