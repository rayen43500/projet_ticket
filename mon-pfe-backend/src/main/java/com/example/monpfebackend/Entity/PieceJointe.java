package com.example.monpfebackend.Entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomFichier;

    @Column(nullable = false)
    private String type;

    @Column(nullable = true)
    private String cheminFichier;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateFichier;

    // La pièce jointe est liée à un seul ticket
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // La pièce jointe est ajoutée par un utilisateur (créateur ou intervenant)
    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur uploader;

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomFichier() {
        return nomFichier;
    }

    public void setNomFichier(String nomFichier) {
        this.nomFichier = nomFichier;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCheminFichier() {
        return cheminFichier;
    }

    public void setCheminFichier(String cheminFichier) {
        this.cheminFichier = cheminFichier;
    }

    public Date getDateFichier() {
        return dateFichier;
    }

    public void setDateFichier(Date dateFichier) {
        this.dateFichier = dateFichier;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public Utilisateur getUploader() {
        return uploader;
    }

    public void setUploader(Utilisateur uploader) {
        this.uploader = uploader;
    }
}