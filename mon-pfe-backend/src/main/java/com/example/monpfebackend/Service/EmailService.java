package com.example.monpfebackend.Service;

import com.example.monpfebackend.Entity.Commentaire;
import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Entity.Ticket;
import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.mail.username:noreply@ticketing.com}")
    private String fromEmail;

    /**
     * Envoie une notification aux intervenants du groupe lorsqu'un nouveau ticket est créé
     * @param ticket Le ticket nouvellement créé
     */
    public void sendNewTicketNotification(Ticket ticket) {
        Groupe groupe = ticket.getGroupe();
        if (groupe == null) return;

        // Récupérer tous les intervenants du groupe
        List<Utilisateur> intervenants = userRepository.findByGroupeAndRole(
                groupe, Utilisateur.Role.INTERVENANT);

        if (intervenants.isEmpty()) return;

        // Créer le message
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setSubject("Nouveau ticket - " + ticket.getSujet());
        message.setText(createNewTicketEmailContent(ticket));

        // Envoyer à tous les intervenants
        for (Utilisateur intervenant : intervenants) {
            if (intervenant.getEmail() != null && !intervenant.getEmail().isEmpty()) {
                message.setTo(intervenant.getEmail());
                emailSender.send(message);
            }
        }
    }

    /**
     * Envoie une notification au créateur d'un ticket lorsque celui-ci est clôturé
     * @param ticket Le ticket clôturé
     */
    public void sendTicketClosedNotification(Ticket ticket) {
        Utilisateur createur = ticket.getCreateur();
        if (createur == null || createur.getEmail() == null || createur.getEmail().isEmpty()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(createur.getEmail());
        message.setSubject("Ticket clôturé - " + ticket.getSujet());
        message.setText(createTicketClosedEmailContent(ticket));

        emailSender.send(message);
    }

    /**
     * Envoie une notification lorsqu'un nouveau commentaire est ajouté à un ticket
     * @param ticket Le ticket concerné
     * @param commentaire Le nouveau commentaire
     */
    public void sendNewCommentNotification(Ticket ticket, Commentaire commentaire) {
        // Récupérer toutes les personnes concernées par le ticket
        // 1. Le créateur du ticket
        // 2. L'intervenant assigné au ticket
        // 3. Les autres personnes ayant commenté le ticket

        List<String> emailsToNotify = userRepository.findEmailsOfPeopleInvolvedInTicket(ticket.getId())
                .stream()
                .filter(email -> email != null && !email.isEmpty())
                // Ne pas notifier l'auteur du commentaire sur son propre commentaire
                .filter(email -> !email.equals(commentaire.getAuteur().getEmail()))
                .collect(Collectors.toList());

        if (emailsToNotify.isEmpty()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setSubject("Nouveau commentaire sur le ticket - " + ticket.getSujet());
        message.setText(createNewCommentEmailContent(ticket, commentaire));

        for (String email : emailsToNotify) {
            message.setTo(email);
            emailSender.send(message);
        }
    }

    /**
     * Notification quand un ticket est assigné à un intervenant
     * @param ticket Le ticket assigné
     */
    public void sendTicketAssignedNotification(Ticket ticket) {
        if (ticket.getIntervenant() == null || 
            ticket.getIntervenant().getEmail() == null || 
            ticket.getIntervenant().getEmail().isEmpty()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(ticket.getIntervenant().getEmail());
        message.setSubject("Ticket assigné - " + ticket.getSujet());
        message.setText(createTicketAssignedEmailContent(ticket));

        emailSender.send(message);
    }

    // Méthodes d'aide pour créer le contenu des emails

    private String createNewTicketEmailContent(Ticket ticket) {
        StringBuilder content = new StringBuilder();
        content.append("Nouveau ticket créé dans votre groupe ").append(ticket.getGroupe().getNom()).append("\n\n");
        content.append("Sujet: ").append(ticket.getSujet()).append("\n");
        content.append("Description: ").append(ticket.getDescription()).append("\n");
        content.append("Urgence: ").append(ticket.getUrgence()).append("\n");
        content.append("Type: ").append(ticket.getType()).append("\n");
        content.append("Créé par: ").append(ticket.getCreateur().getNom()).append(" ").append(ticket.getCreateur().getPrenom()).append("\n\n");
        content.append("Pour consulter ce ticket, connectez-vous à l'application de gestion des tickets.");
        return content.toString();
    }

    private String createTicketClosedEmailContent(Ticket ticket) {
        StringBuilder content = new StringBuilder();
        content.append("Votre ticket a été clôturé.\n\n");
        content.append("Sujet: ").append(ticket.getSujet()).append("\n");
        content.append("Description: ").append(ticket.getDescription()).append("\n");
        content.append("Traité par: ");
        if (ticket.getIntervenant() != null) {
            content.append(ticket.getIntervenant().getNom()).append(" ").append(ticket.getIntervenant().getPrenom());
        } else {
            content.append("Non assigné");
        }
        content.append("\n\n");
        content.append("Pour consulter les détails, connectez-vous à l'application de gestion des tickets.");
        return content.toString();
    }

    private String createNewCommentEmailContent(Ticket ticket, Commentaire commentaire) {
        StringBuilder content = new StringBuilder();
        content.append("Un nouveau commentaire a été ajouté au ticket: ").append(ticket.getSujet()).append("\n\n");
        content.append("Commentaire de: ").append(commentaire.getAuteur().getNom()).append(" ").append(commentaire.getAuteur().getPrenom()).append("\n");
        content.append("Commentaire: ").append(commentaire.getContenu()).append("\n\n");
        content.append("Pour consulter ce ticket, connectez-vous à l'application de gestion des tickets.");
        return content.toString();
    }

    private String createTicketAssignedEmailContent(Ticket ticket) {
        StringBuilder content = new StringBuilder();
        content.append("Un ticket vous a été assigné.\n\n");
        content.append("Sujet: ").append(ticket.getSujet()).append("\n");
        content.append("Description: ").append(ticket.getDescription()).append("\n");
        content.append("Urgence: ").append(ticket.getUrgence()).append("\n");
        content.append("Type: ").append(ticket.getType()).append("\n");
        content.append("Créé par: ").append(ticket.getCreateur().getNom()).append(" ").append(ticket.getCreateur().getPrenom()).append("\n\n");
        content.append("Pour consulter ce ticket, connectez-vous à l'application de gestion des tickets.");
        return content.toString();
    }
} 