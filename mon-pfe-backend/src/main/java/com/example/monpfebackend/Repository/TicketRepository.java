package com.example.monpfebackend.Repository;

import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Entity.SousGroupe;
import com.example.monpfebackend.Entity.Ticket;
import com.example.monpfebackend.Entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Find tickets by creator
    List<Ticket> findByCreateur(Utilisateur createur);
    
    // Find tickets assigned to an intervenant
    List<Ticket> findByIntervenant(Utilisateur intervenant);
    
    // Find tickets by group
    List<Ticket> findByGroupe(Groupe groupe);
    
    // Find tickets by subgroup
    List<Ticket> findBySousGroupe(SousGroupe sousGroupe);
    
    // Find tickets by status
    List<Ticket> findByStatut(Ticket.Statut statut);
    
    // Count tickets by status
    int countByStatut(Ticket.Statut statut);
    
    // Find tickets by type
    List<Ticket> findByType(Ticket.Type type);
    
    // Find tickets by urgency level
    List<Ticket> findByUrgence(Ticket.Urgence urgence);
    
    // Find tickets by creation date between two dates
    List<Ticket> findByDateCreationBetween(Date startDate, Date endDate);
    
    // Search tickets by subject containing keyword
    List<Ticket> findBySujetContainingIgnoreCase(String keyword);
    
    // Search tickets by description containing keyword
    List<Ticket> findByDescriptionContainingIgnoreCase(String keyword);
    
    // Advanced search with multiple criteria
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:sujet IS NULL OR LOWER(t.sujet) LIKE LOWER(CONCAT('%', :sujet, '%'))) AND " +
           "(:statut IS NULL OR t.statut = :statut) AND " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:urgence IS NULL OR t.urgence = :urgence) AND " +
           "(:groupeId IS NULL OR t.groupe.id = :groupeId) AND " +
           "(:sousGroupeId IS NULL OR t.sousGroupe.id = :sousGroupeId) AND " +
           "(:dateDebut IS NULL OR t.dateCreation >= :dateDebut) AND " +
           "(:dateFin IS NULL OR t.dateCreation <= :dateFin) AND " +
           "(:createurId IS NULL OR t.createur.id = :createurId)")
    List<Ticket> searchTickets(
            @Param("sujet") String sujet,
            @Param("statut") Ticket.Statut statut,
            @Param("type") Ticket.Type type,
            @Param("urgence") Ticket.Urgence urgence,
            @Param("groupeId") Long groupeId,
            @Param("sousGroupeId") Long sousGroupeId,
            @Param("dateDebut") Date dateDebut,
            @Param("dateFin") Date dateFin,
            @Param("createurId") Long createurId
    );
    
    // Count tickets by group
    int countByGroupe(Groupe groupe);
    
    // Find tickets by status and group
    List<Ticket> findByStatutAndGroupe(Ticket.Statut statut, Groupe groupe);
    
    // Find latest tickets (for dashboard)
    List<Ticket> findTop5ByOrderByDateCreationDesc();
    
    // Count tickets by urgency
    int countByUrgence(Ticket.Urgence urgence);
} 