package com.example.monpfebackend.Repository;

import com.example.monpfebackend.Entity.PieceJointe;
import com.example.monpfebackend.Entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PieceJointeRepository extends JpaRepository<PieceJointe, Long> {
    
    // Find file attachments by ticket
    List<PieceJointe> findByTicket(Ticket ticket);
    
    // Find file attachments by ticket ID
    List<PieceJointe> findByTicketId(Long ticketId);
    
    // Delete all file attachments for a ticket
    void deleteByTicketId(Long ticketId);
} 