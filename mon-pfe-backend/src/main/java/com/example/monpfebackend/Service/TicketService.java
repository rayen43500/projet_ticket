package com.example.monpfebackend.Service;

import com.example.monpfebackend.Entity.*;
import com.example.monpfebackend.Repository.*;
import com.example.monpfebackend.dto.TicketDTO;
import com.example.monpfebackend.dto.TicketStatisticsDTO;
import com.example.monpfebackend.dto.StatisticsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupeRepository groupeRepository;

    @Autowired
    private SousGroupeRepository sousGroupeRepository;

    @Autowired
    private PieceJointeRepository pieceJointeRepository;

    @Autowired
    private CommentaireRepository commentaireRepository;
    
    

    private final Path fileStorageLocation = Paths.get("uploads");

    public TicketService() {
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de stockage des fichiers", e);
        }
    }

    // Récupérer tous les tickets
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    // Récupérer un ticket par ID
    public Optional<TicketDTO> getTicketById(Long id) {
        return ticketRepository.findById(id).map(TicketDTO::new);
    }

    // Récupérer les tickets d'un utilisateur
    public List<TicketDTO> getTicketsByUser(Long userId) {
        Optional<Utilisateur> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return ticketRepository.findByCreateur(user.get()).stream()
                    .map(TicketDTO::new)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Récupérer les tickets assignés à un intervenant
    public List<TicketDTO> getTicketsByIntervenant(Long intervenantId) {
        Optional<Utilisateur> intervenant = userRepository.findById(intervenantId);
        if (intervenant.isPresent()) {
            // Vérifier si l'utilisateur est bien un intervenant
            if (intervenant.get().getRole() != Utilisateur.Role.INTERVENANT) {
                return List.of(); // Retourner une liste vide si ce n'est pas un intervenant
            }
            
            // Récupérer les tickets déjà assignés à cet intervenant
            List<Ticket> assignedTickets = ticketRepository.findByIntervenant(intervenant.get());
            
            // Si l'intervenant appartient à un groupe, récupérer aussi les tickets de ce groupe
            // qui ne sont pas encore assignés ou qui sont assignés à cet intervenant
            List<Ticket> groupTickets = new ArrayList<>();
            if (intervenant.get().getGroupe() != null) {
                Groupe groupe = intervenant.get().getGroupe();
                
                // Tickets du groupe qui sont en attente (non assignés)
                List<Ticket> pendingGroupTickets = ticketRepository.findByStatutAndGroupe(
                        Ticket.Statut.EN_ATTENTE, groupe);
                
                // Tickets du groupe déjà assignés à l'intervenant ou en attente
                groupTickets.addAll(ticketRepository.findByGroupe(groupe).stream()
                        .filter(ticket -> ticket.getStatut() == Ticket.Statut.EN_ATTENTE || 
                                         (ticket.getIntervenant() != null && 
                                          ticket.getIntervenant().getId().equals(intervenantId)))
                        .collect(Collectors.toList()));
            }
            
            // Combiner les deux listes sans doublons
            for (Ticket ticket : groupTickets) {
                if (!assignedTickets.contains(ticket)) {
                    assignedTickets.add(ticket);
                }
            }
            
            return assignedTickets.stream()
                    .map(TicketDTO::new)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Récupérer les tickets d'un groupe
    public List<TicketDTO> getTicketsByGroupe(Long groupeId) {
        Optional<Groupe> groupe = groupeRepository.findById(groupeId);
        if (groupe.isPresent()) {
            return ticketRepository.findByGroupe(groupe.get()).stream()
                    .map(TicketDTO::new)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Récupérer les tickets par statut
    public List<TicketDTO> getTicketsByStatut(Ticket.Statut statut) {
        return ticketRepository.findByStatut(statut).stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }
    
    // Mettre à jour le statut d'un ticket
    @Transactional
    public TicketDTO updateTicketStatus(Long ticketId, Ticket.Statut newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        
        Ticket.Statut oldStatus = ticket.getStatut();
        ticket.setStatut(newStatus);
        
        // Si le ticket est clôturé, on peut envoyer une notification par email
        if (newStatus == Ticket.Statut.CLOTURE && oldStatus != Ticket.Statut.CLOTURE) {
            // Notification par email
            // // emailservice.sendTicketClosedNotification(ticket);
        }
        
        return new TicketDTO(ticketRepository.save(ticket));
    }
    
    // Assigner un ticket à un intervenant
    @Transactional
    public TicketDTO assignTicketToIntervenant(Long ticketId, Long intervenantId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        
        Utilisateur intervenant = userRepository.findById(intervenantId)
                .orElseThrow(() -> new RuntimeException("Intervenant non trouvé"));
        
        // Vérifier que l'utilisateur est bien un intervenant
        if (intervenant.getRole() != Utilisateur.Role.INTERVENANT) {
            throw new RuntimeException("L'utilisateur n'est pas un intervenant");
        }
        
        // Vérifier que l'intervenant appartient au même groupe que le ticket
        if (intervenant.getGroupe() == null || !intervenant.getGroupe().getId().equals(ticket.getGroupe().getId())) {
            throw new RuntimeException("L'intervenant n'appartient pas au groupe du ticket");
        }
        
        ticket.setIntervenant(intervenant);
        
        // Mettre à jour le statut si le ticket était en attente
        if (ticket.getStatut() == Ticket.Statut.EN_ATTENTE) {
            ticket.setStatut(Ticket.Statut.EN_COURS);
        }
        
        // Envoyer une notification à l'intervenant
        // emailservice.sendTicketAssignedNotification(ticket);
        
        return new TicketDTO(ticketRepository.save(ticket));
    }
    
    // Obtenir des statistiques sur les tickets
    public TicketStatisticsDTO getTicketStatistics() {
        int total = (int) ticketRepository.count();
        int enAttente = ticketRepository.countByStatut(Ticket.Statut.EN_ATTENTE);
        int enCours = ticketRepository.countByStatut(Ticket.Statut.EN_COURS);
        int traites = ticketRepository.countByStatut(Ticket.Statut.TRAITE);
        int clotures = ticketRepository.countByStatut(Ticket.Statut.CLOTURE);
        
        return new TicketStatisticsDTO(total, enAttente, enCours, traites, clotures);
    }

    // Créer un nouveau ticket
    @Transactional
    public TicketDTO createTicket(String sujet, String description, Ticket.Type type, 
                                Ticket.Urgence urgence, Long createurId, Long groupeId, 
                                Long sousGroupeId, List<MultipartFile> files) {
        
        Utilisateur createur = userRepository.findById(createurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Groupe groupe = groupeRepository.findById(groupeId)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));
        
        SousGroupe sousGroupe = null;
        if (sousGroupeId != null) {
            sousGroupe = sousGroupeRepository.findById(sousGroupeId)
                    .orElseThrow(() -> new RuntimeException("Sous-groupe non trouvé"));
        }
        
        Ticket ticket = new Ticket();
        ticket.setSujet(sujet);
        ticket.setDescription(description);
        ticket.setType(type);
        ticket.setUrgence(urgence);
        ticket.setStatut(Ticket.Statut.EN_ATTENTE);
        ticket.setCreateur(createur);
        ticket.setGroupe(groupe);
        ticket.setSousGroupe(sousGroupe);
        ticket.setDateCreation(new Date());
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Traiter les pièces jointes si présentes
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                addAttachmentToTicket(savedTicket, createur, file);
            }
        }
        
        // Notifier les intervenants du groupe qu'un nouveau ticket a été créé
        // // emailservice.sendNewTicketNotification(savedTicket);
        
        return new TicketDTO(savedTicket);
    }

    // Ajouter un commentaire à un ticket
    @Transactional
    public void addComment(Long ticketId, Long auteurId, String contenu) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        
        Utilisateur auteur = userRepository.findById(auteurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Commentaire commentaire = new Commentaire();
        commentaire.setTicket(ticket);
        commentaire.setAuteur(auteur);
        commentaire.setContenu(contenu);
        commentaire.setDateCommentaire(new Date());
        
        commentaireRepository.save(commentaire);
        
        // Notifier les personnes concernées du nouveau commentaire
        // // emailservice.sendNewCommentNotification(ticket, commentaire);
    }
    
    // Ajouter une pièce jointe à un ticket
    @Transactional
    public void addAttachment(Long ticketId, Long uploaderId, MultipartFile file) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        
        Utilisateur uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        addAttachmentToTicket(ticket, uploader, file);
    }
    
    // Méthode utilitaire pour ajouter une pièce jointe
    private void addAttachmentToTicket(Ticket ticket, Utilisateur uploader, MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetPath = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath);
            
            PieceJointe pieceJointe = new PieceJointe();
            pieceJointe.setTicket(ticket);
            pieceJointe.setUploader(uploader);
            pieceJointe.setNomFichier(file.getOriginalFilename());
            pieceJointe.setCheminFichier(fileName);
            pieceJointe.setDateFichier(new Date());
            pieceJointe.setType(file.getContentType());
            
            pieceJointeRepository.save(pieceJointe);
        } catch (IOException ex) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier", ex);
        }
    }
    
    // Rechercher des tickets avec plusieurs critères
    public List<TicketDTO> searchTickets(
            String sujet, Ticket.Statut statut, Ticket.Type type, Ticket.Urgence urgence,
            Long groupeId, Long sousGroupeId, Date dateDebut, Date dateFin, Long createurId) {
        
        return ticketRepository.searchTickets(
                    sujet, statut, type, urgence, groupeId, sousGroupeId,
                    dateDebut, dateFin, createurId).stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }
    
    // Recherche avancée avec une Map de critères
    public List<TicketDTO> advancedSearchTickets(Map<String, Object> searchCriteria) {
        String sujet = (String) searchCriteria.get("sujet");
        
        final Ticket.Statut statutFinal;
        String statut = (String) searchCriteria.get("statut");
        if (statut != null && !statut.isEmpty()) {
            statutFinal = Ticket.Statut.valueOf(statut.toUpperCase());
        } else {
            statutFinal = null;
        }
        
        final Ticket.Type typeFinal;
        String type = (String) searchCriteria.get("type");
        if (type != null && !type.isEmpty()) {
            typeFinal = Ticket.Type.valueOf(type.toUpperCase());
        } else {
            typeFinal = null;
        }
        
        final Ticket.Urgence urgenceFinal;
        String urgence = (String) searchCriteria.get("urgence");
        if (urgence != null && !urgence.isEmpty()) {
            urgenceFinal = Ticket.Urgence.valueOf(urgence.toUpperCase());
        } else {
            urgenceFinal = null;
        }
        
        Long groupeId = searchCriteria.get("groupeId") != null ? 
                Long.valueOf(searchCriteria.get("groupeId").toString()) : null;
        
        Long sousGroupeId = searchCriteria.get("sousGroupeId") != null ? 
                Long.valueOf(searchCriteria.get("sousGroupeId").toString()) : null;
        
        Date dateDebut = (Date) searchCriteria.get("dateDebut");
        Date dateFin = (Date) searchCriteria.get("dateFin");
        
        Long createurId = searchCriteria.get("createurId") != null ? 
                Long.valueOf(searchCriteria.get("createurId").toString()) : null;
        
        Long intervenantId = searchCriteria.get("intervenantId") != null ? 
                Long.valueOf(searchCriteria.get("intervenantId").toString()) : null;
        
        if (intervenantId != null) {
            // Récupérer d'abord les tickets de l'intervenant
            Utilisateur intervenant = userRepository.findById(intervenantId)
                    .orElseThrow(() -> new RuntimeException("Intervenant non trouvé"));
            
            List<Ticket> intervenantTickets = ticketRepository.findByIntervenant(intervenant);
            
            // Filtrer davantage ces tickets selon d'autres critères
            return intervenantTickets.stream()
                    .filter(t -> sujet == null || t.getSujet().toLowerCase().contains(sujet.toLowerCase()))
                    .filter(t -> statutFinal == null || t.getStatut() == statutFinal)
                    .filter(t -> typeFinal == null || t.getType() == typeFinal)
                    .filter(t -> urgenceFinal == null || t.getUrgence() == urgenceFinal)
                    .filter(t -> groupeId == null || t.getGroupe().getId().equals(groupeId))
                    .filter(t -> sousGroupeId == null || (t.getSousGroupe() != null && t.getSousGroupe().getId().equals(sousGroupeId)))
                    .filter(t -> dateDebut == null || !t.getDateCreation().before(dateDebut))
                    .filter(t -> dateFin == null || !t.getDateCreation().after(dateFin))
                    .filter(t -> createurId == null || t.getCreateur().getId().equals(createurId))
                    .map(TicketDTO::new)
                    .collect(Collectors.toList());
        } else {
            // Utiliser la méthode de recherche standard
            return searchTickets(sujet, statutFinal, typeFinal, urgenceFinal, groupeId, sousGroupeId, dateDebut, dateFin, createurId);
        }
    }
    
    // Obtenir des statistiques complètes
    public StatisticsDTO getComprehensiveStatistics() {
        StatisticsDTO stats = new StatisticsDTO();
        
        // Statistiques générales des tickets
        TicketStatisticsDTO ticketStats = getTicketStatistics();
        stats.setGlobalStats(ticketStats);
        
        // Statistiques par urgence
        Map<String, Integer> ticketsByUrgency = new HashMap<>();
        ticketsByUrgency.put("FAIBLE", ticketRepository.countByUrgence(Ticket.Urgence.FAIBLE));
        ticketsByUrgency.put("MOYENNE", ticketRepository.countByUrgence(Ticket.Urgence.MOYENNE));
        ticketsByUrgency.put("HAUTE", ticketRepository.countByUrgence(Ticket.Urgence.HAUTE));
        stats.setTicketsByUrgency(ticketsByUrgency);
        
        // Statistiques par groupe
        Map<String, Integer> ticketsByGroup = new HashMap<>();
        Map<Long, Integer> ticketsByProjectId = new HashMap<>();
        final List<Groupe> groupes = groupeRepository.findAll();
        for (Groupe groupe : groupes) {
            ticketsByGroup.put(groupe.getNom(), ticketRepository.countByGroupe(groupe));
            ticketsByProjectId.put(groupe.getId(), ticketRepository.countByGroupe(groupe));
        }
        stats.setTicketsByProjectName(ticketsByGroup);
        stats.setTicketsByProject(ticketsByProjectId);
        
        return stats;
    }
    
    // Méthodes utilitaires pour parser les énumérations
    private Ticket.Statut parseStatut(String statut) {
        if (statut == null || statut.isEmpty()) return null;
        try {
            return Ticket.Statut.valueOf(statut.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    private Ticket.Type parseType(String type) {
        if (type == null || type.isEmpty()) return null;
        try {
            return Ticket.Type.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    private Ticket.Urgence parseUrgence(String urgence) {
        if (urgence == null || urgence.isEmpty()) return null;
        try {
            return Ticket.Urgence.valueOf(urgence.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // Mettre à jour les propriétés d'un ticket
    @Transactional
    public TicketDTO updateTicket(Long id, String sujet, String description, Ticket.Type type, 
                               Ticket.Urgence urgence, Long groupeId, Long sousGroupeId) {
        
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé avec l'id " + id));
        
        ticket.setSujet(sujet);
        ticket.setDescription(description);
        ticket.setType(type);
        ticket.setUrgence(urgence);
        
        // Mettre à jour le groupe
        Groupe groupe = groupeRepository.findById(groupeId)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id " + groupeId));
        ticket.setGroupe(groupe);
        
        // Mettre à jour le sous-groupe si présent
        if (sousGroupeId != null) {
            SousGroupe sousGroupe = sousGroupeRepository.findById(sousGroupeId)
                    .orElseThrow(() -> new RuntimeException("Sous-groupe non trouvé avec l'id " + sousGroupeId));
            ticket.setSousGroupe(sousGroupe);
        } else {
            ticket.setSousGroupe(null);
        }
        
        return new TicketDTO(ticketRepository.save(ticket));
    }
} 