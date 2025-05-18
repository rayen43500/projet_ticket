package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.Commentaire;
import java.util.Date;

public class CommentaireDTO {
    private Long id;
    private String contenu;
    private Date dateCreation;
    private Long auteurId;
    private String auteurNom;
    private Long ticketId;
    
    // Default constructor
    public CommentaireDTO() {}
    
    // Constructor from entity
    public CommentaireDTO(Commentaire commentaire) {
        this.id = commentaire.getId();
        this.contenu = commentaire.getContenu();
        this.dateCreation = commentaire.getDateCommentaire();
        
        if (commentaire.getAuteur() != null) {
            this.auteurId = commentaire.getAuteur().getId();
            this.auteurNom = commentaire.getAuteur().getNom();
        }
        
        if (commentaire.getTicket() != null) {
            this.ticketId = commentaire.getTicket().getId();
        }
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContenu() {
        return contenu;
    }
    
    public void setContenu(String contenu) {
        this.contenu = contenu;
    }
    
    public Date getDateCreation() {
        return dateCreation;
    }
    
    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }
    
    public Long getAuteurId() {
        return auteurId;
    }
    
    public void setAuteurId(Long auteurId) {
        this.auteurId = auteurId;
    }
    
    public String getAuteurNom() {
        return auteurNom;
    }
    
    public void setAuteurNom(String auteurNom) {
        this.auteurNom = auteurNom;
    }
    
    public Long getTicketId() {
        return ticketId;
    }
    
    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }
} 