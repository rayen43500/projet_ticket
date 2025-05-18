package com.example.monpfebackend.Entity;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
public class Ticket {

    public enum Statut {
        EN_ATTENTE,
        EN_COURS,
        TRAITE,
        CLOTURE
    }

    public enum Type {
        INCIDENT,
        DEMANDE,
        ASSISTANCE,
        AUTRE
    }

    public enum Urgence {
        FAIBLE,
        MOYENNE,
        HAUTE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sujet;

    @Column(nullable = false)
    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation;

    @Enumerated(EnumType.STRING)
    private Statut statut;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Enumerated(EnumType.STRING)
    private Urgence urgence;

    // Créateur : UTILISATEUR normal
    @ManyToOne(optional = false)
    @JoinColumn(name = "createur_id")
    private Utilisateur createur;

    // Intervenant
    @ManyToOne
    @JoinColumn(name = "intervenant_id")
    private Utilisateur intervenant;

    // Un ticket appartient à un seul groupe
    @ManyToOne(optional = false)
    @JoinColumn(name = "groupe_id")
    private Groupe groupe;

    // Sous-groupe (optionnel)
    @ManyToOne
    @JoinColumn(name = "sous_groupe_id")
    private SousGroupe sousGroupe;

    // Un ticket peut avoir plusieurs commentaires
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Commentaire> commentaires;

    // Un ticket peut avoir plusieurs pièces jointes
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PieceJointe> piecesJointes;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = new Date();
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSujet() {
        return sujet;
    }

    public void setSujet(String sujet) {
        this.sujet = sujet;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Statut getStatut() {
        return statut;
    }

    public void setStatut(Statut statut) {
        this.statut = statut;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public Urgence getUrgence() {
        return urgence;
    }

    public void setUrgence(Urgence urgence) {
        this.urgence = urgence;
    }

    public Utilisateur getCreateur() {
        return createur;
    }

    public void setCreateur(Utilisateur createur) {
        this.createur = createur;
    }

    public Utilisateur getIntervenant() {
        return intervenant;
    }

    public void setIntervenant(Utilisateur intervenant) {
        this.intervenant = intervenant;
    }

    public Groupe getGroupe() {
        return groupe;
    }

    public void setGroupe(Groupe groupe) {
        this.groupe = groupe;
    }

    public SousGroupe getSousGroupe() {
        return sousGroupe;
    }

    public void setSousGroupe(SousGroupe sousGroupe) {
        this.sousGroupe = sousGroupe;
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
