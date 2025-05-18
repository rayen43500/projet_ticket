package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.Ticket;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class TicketDTO {
    private Long id;
    private String sujet;
    private String description;
    private Date dateCreation;
    private String statut;
    private String type;
    private String urgence;
    private Long createurId;
    private String createurNom;
    private Long intervenantId;
    private String intervenantNom;
    private Long groupeId;
    private String groupeNom;
    private Long sousGroupeId;
    private String sousGroupeNom;
    private List<CommentaireDTO> commentaires;
    private List<PieceJointeDTO> piecesJointes;
    
    // Default constructor
    public TicketDTO() {}
    
    // Constructor from entity
    public TicketDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.sujet = ticket.getSujet();
        this.description = ticket.getDescription();
        this.dateCreation = ticket.getDateCreation();
        this.statut = ticket.getStatut().name();
        this.type = ticket.getType().name();
        this.urgence = ticket.getUrgence().name();
        
        if (ticket.getCreateur() != null) {
            this.createurId = ticket.getCreateur().getId();
            this.createurNom = ticket.getCreateur().getNom();
        }
        
        if (ticket.getIntervenant() != null) {
            this.intervenantId = ticket.getIntervenant().getId();
            this.intervenantNom = ticket.getIntervenant().getNom();
        }
        
        if (ticket.getGroupe() != null) {
            this.groupeId = ticket.getGroupe().getId();
            this.groupeNom = ticket.getGroupe().getNom();
        }
        
        if (ticket.getSousGroupe() != null) {
            this.sousGroupeId = ticket.getSousGroupe().getId();
            this.sousGroupeNom = ticket.getSousGroupe().getNom();
        }
        
        if (ticket.getCommentaires() != null) {
            this.commentaires = ticket.getCommentaires().stream()
                .map(CommentaireDTO::new)
                .collect(Collectors.toList());
        }
        
        if (ticket.getPiecesJointes() != null) {
            this.piecesJointes = ticket.getPiecesJointes().stream()
                .map(PieceJointeDTO::new)
                .collect(Collectors.toList());
        }
    }
    
    // Getters and setters
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
    
    public String getStatut() {
        return statut;
    }
    
    public void setStatut(String statut) {
        this.statut = statut;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getUrgence() {
        return urgence;
    }
    
    public void setUrgence(String urgence) {
        this.urgence = urgence;
    }
    
    public Long getCreateurId() {
        return createurId;
    }
    
    public void setCreateurId(Long createurId) {
        this.createurId = createurId;
    }
    
    public String getCreateurNom() {
        return createurNom;
    }
    
    public void setCreateurNom(String createurNom) {
        this.createurNom = createurNom;
    }
    
    public Long getIntervenantId() {
        return intervenantId;
    }
    
    public void setIntervenantId(Long intervenantId) {
        this.intervenantId = intervenantId;
    }
    
    public String getIntervenantNom() {
        return intervenantNom;
    }
    
    public void setIntervenantNom(String intervenantNom) {
        this.intervenantNom = intervenantNom;
    }
    
    public Long getGroupeId() {
        return groupeId;
    }
    
    public void setGroupeId(Long groupeId) {
        this.groupeId = groupeId;
    }
    
    public String getGroupeNom() {
        return groupeNom;
    }
    
    public void setGroupeNom(String groupeNom) {
        this.groupeNom = groupeNom;
    }
    
    public Long getSousGroupeId() {
        return sousGroupeId;
    }
    
    public void setSousGroupeId(Long sousGroupeId) {
        this.sousGroupeId = sousGroupeId;
    }
    
    public String getSousGroupeNom() {
        return sousGroupeNom;
    }
    
    public void setSousGroupeNom(String sousGroupeNom) {
        this.sousGroupeNom = sousGroupeNom;
    }
    
    public List<CommentaireDTO> getCommentaires() {
        return commentaires;
    }
    
    public void setCommentaires(List<CommentaireDTO> commentaires) {
        this.commentaires = commentaires;
    }
    
    public List<PieceJointeDTO> getPiecesJointes() {
        return piecesJointes;
    }
    
    public void setPiecesJointes(List<PieceJointeDTO> piecesJointes) {
        this.piecesJointes = piecesJointes;
    }
} 