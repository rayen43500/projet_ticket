package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.PieceJointe;
import java.util.Date;

public class PieceJointeDTO {
    private Long id;
    private String nomFichier;
    private String typeFichier;
    private Long tailleFichier;
    private Date dateAjout;
    private Long ticketId;
    
    // Default constructor
    public PieceJointeDTO() {}
    
    // Constructor from entity
    public PieceJointeDTO(PieceJointe pieceJointe) {
        this.id = pieceJointe.getId();
        this.nomFichier = pieceJointe.getNomFichier();
        this.typeFichier = pieceJointe.getType();
        this.dateAjout = pieceJointe.getDateFichier();
        
        if (pieceJointe.getTicket() != null) {
            this.ticketId = pieceJointe.getTicket().getId();
        }
    }
    
    // Getters and setters
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
    
    public String getTypeFichier() {
        return typeFichier;
    }
    
    public void setTypeFichier(String typeFichier) {
        this.typeFichier = typeFichier;
    }
    
    public Long getTailleFichier() {
        return tailleFichier;
    }
    
    public void setTailleFichier(Long tailleFichier) {
        this.tailleFichier = tailleFichier;
    }
    
    public Date getDateAjout() {
        return dateAjout;
    }
    
    public void setDateAjout(Date dateAjout) {
        this.dateAjout = dateAjout;
    }
    
    public Long getTicketId() {
        return ticketId;
    }
    
    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }
} 