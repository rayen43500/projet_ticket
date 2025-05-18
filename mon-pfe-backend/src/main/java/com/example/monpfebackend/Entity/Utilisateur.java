package com.example.monpfebackend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Utilisateur {
    public enum Role {
        ADMIN,
        INTERVENANT,
        UTILISATEUR
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;
    
    @Column
    private String prenom;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Relation ManyToOne avec Groupe
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupe_id")
    @JsonIgnoreProperties("intervenants")
    private Groupe groupe;

    // Un UTILISATEUR normal peut créer plusieurs tickets
    @OneToMany(mappedBy = "createur",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<Ticket> ticketsCréés = new ArrayList<>();

    // Un INTERVENANT peut être assigné à plusieurs tickets
    @OneToMany(mappedBy = "intervenant")
    @JsonIgnore
    private List<Ticket> ticketsAssignés = new ArrayList<>();

    // Un utilisateur peut écrire plusieurs commentaires
    @OneToMany(mappedBy = "auteur",
            cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Commentaire> commentaires = new ArrayList<>();

    // Un utilisateur peut ajouter plusieurs pièces jointes
    @OneToMany(mappedBy = "uploader",
            cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PieceJointe> piecesJointes = new ArrayList<>();

    // Constructeurs
    public Utilisateur() {}

    public Utilisateur(String nom, String prenom, String email, String password, Role role) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters & Setters (inchangés)
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
    
    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Groupe getGroupe() {
        return groupe;
    }

    public void setGroupe(Groupe groupe) {
        this.groupe = groupe;
    }

    public List<Ticket> getTicketsCréés() {
        return ticketsCréés;
    }

    public void setTicketsCréés(List<Ticket> ticketsCréés) {
        this.ticketsCréés = ticketsCréés;
    }

    public List<Ticket> getTicketsAssignés() {
        return ticketsAssignés;
    }

    public void setTicketsAssignés(List<Ticket> ticketsAssignés) {
        this.ticketsAssignés = ticketsAssignés;
    }

    public List<Commentaire> getCommentaires() {
        return commentaires;
    }

    public void setCommentaires(List<Commentaire> commentaires) {
        this.commentaires = commentaires;
    }

    public List<PieceJointe> getPiecesJointes() {
        return piecesJointes;
    }

    public void setPiecesJointes(List<PieceJointe> piecesJointes) {
        this.piecesJointes = piecesJointes;
    }
}


