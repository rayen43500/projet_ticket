package com.example.monpfebackend.Repository;

import com.example.monpfebackend.Entity.Commentaire;
import com.example.monpfebackend.Entity.Ticket;
import com.example.monpfebackend.Entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    
    // Find comments by ticket
    List<Commentaire> findByTicket(Ticket ticket);
    
    // Find comments by ticket ID
    List<Commentaire> findByTicketId(Long ticketId);
    
    // Find comments by author
    List<Commentaire> findByAuteur(Utilisateur auteur);
    
    // Find comments by ticket ordered by creation date (newest first)
    List<Commentaire> findByTicketOrderByDateCommentaireDesc(Ticket ticket);
} 