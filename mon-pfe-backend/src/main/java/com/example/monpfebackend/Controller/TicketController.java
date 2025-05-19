package com.example.monpfebackend.Controller;

import com.example.monpfebackend.Entity.Ticket;
import com.example.monpfebackend.Service.TicketService;
import com.example.monpfebackend.dto.TicketDTO;
import com.example.monpfebackend.dto.TicketStatisticsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // Récupérer tous les tickets
    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // Récupérer un ticket par ID
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        Optional<TicketDTO> ticket = ticketService.getTicketById(id);
        return ticket.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Récupérer les tickets d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }
    
    // Récupérer les tickets assignés à un intervenant
    @GetMapping("/intervenant/{intervenantId}")
    public ResponseEntity<List<TicketDTO>> getTicketsForIntervenant(@PathVariable Long intervenantId) {
        return ResponseEntity.ok(ticketService.getTicketsByIntervenant(intervenantId));
    }
    
    // Récupérer les tickets d'un groupe
    @GetMapping("/groupe/{groupeId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByGroupe(@PathVariable Long groupeId) {
        return ResponseEntity.ok(ticketService.getTicketsByGroupe(groupeId));
    }
    
    // Récupérer les tickets par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<TicketDTO>> getTicketsByStatut(@PathVariable Ticket.Statut statut) {
        return ResponseEntity.ok(ticketService.getTicketsByStatut(statut));
    }

    // Mettre à jour le statut d'un ticket
    @PatchMapping("/{id}/statut")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        
        String statutStr = payload.get("statut");
        Ticket.Statut statut;
        try {
            statut = Ticket.Statut.valueOf(statutStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        
        TicketDTO updatedTicket = ticketService.updateTicketStatus(id, statut);
        return ResponseEntity.ok(updatedTicket);
    }
    
    // Assigner un ticket à un intervenant
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketDTO> assignTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        
        Long intervenantId = payload.get("intervenantId");
        if (intervenantId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        TicketDTO updatedTicket = ticketService.assignTicketToIntervenant(id, intervenantId);
        return ResponseEntity.ok(updatedTicket);
    }
    
    // Obtenir des statistiques sur les tickets
    @GetMapping("/stats")
    public ResponseEntity<TicketStatisticsDTO> getTicketsStats() {
        return ResponseEntity.ok(ticketService.getTicketStatistics());
    }

    // Créer un nouveau ticket
    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(
            @RequestParam String sujet,
            @RequestParam String description,
            @RequestParam Ticket.Type type,
            @RequestParam Ticket.Urgence urgence,
            @RequestParam Long createurId,
            @RequestParam Long groupeId,
            @RequestParam(required = false) Long sousGroupeId,
            @RequestParam(required = false) List<MultipartFile> files) {

        TicketDTO createdTicket = ticketService.createTicket(
                sujet, description, type, urgence,
                createurId, groupeId, sousGroupeId, files);

        return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
    }

    // Ajouter un commentaire à un ticket
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<Void> addComment(
            @PathVariable Long ticketId,
            @RequestParam Long auteurId,
            @RequestParam String contenu) {

        ticketService.addComment(ticketId, auteurId, contenu);
        return ResponseEntity.ok().build();
    }
    
    // Ajouter une pièce jointe à un ticket
    @PostMapping("/{ticketId}/attachment")
    public ResponseEntity<Void> addAttachment(
            @PathVariable Long ticketId,
            @RequestParam Long uploaderId,
            @RequestParam("file") MultipartFile file) {
        
        ticketService.addAttachment(ticketId, uploaderId, file);
        return ResponseEntity.ok().build();
    }

    // Rechercher des tickets
    @GetMapping("/search")
    public ResponseEntity<List<TicketDTO>> searchTickets(
            @RequestParam(required = false) String sujet,
            @RequestParam(required = false) Ticket.Statut statut,
            @RequestParam(required = false) Ticket.Type type,
            @RequestParam(required = false) Ticket.Urgence urgence,
            @RequestParam(required = false) Long groupeId,
            @RequestParam(required = false) Long sousGroupeId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateDebut,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateFin,
            @RequestParam(required = false) Long createurId) {

        List<TicketDTO> tickets = ticketService.searchTickets(
                sujet, statut, type, urgence, groupeId,
                sousGroupeId, dateDebut, dateFin, createurId);

        return ResponseEntity.ok(tickets);
    }
    
    // Recherche avancée (post pour les critères complexes)
    @PostMapping("/search")
    public ResponseEntity<List<TicketDTO>> advancedSearchTickets(@RequestBody Map<String, Object> searchCriteria) {
        List<TicketDTO> tickets = ticketService.advancedSearchTickets(searchCriteria);
        return ResponseEntity.ok(tickets);
    }

    // Mettre à jour un ticket
    @PutMapping("/{id}")
    public ResponseEntity<TicketDTO> updateTicket(
            @PathVariable Long id,
            @RequestParam String sujet,
            @RequestParam String description,
            @RequestParam Ticket.Type type,
            @RequestParam Ticket.Urgence urgence,
            @RequestParam Long groupeId,
            @RequestParam(required = false) Long sousGroupeId) {

        TicketDTO updatedTicket = ticketService.updateTicket(
                id, sujet, description, type, urgence, groupeId, sousGroupeId);

        return ResponseEntity.ok(updatedTicket);
    }
} 