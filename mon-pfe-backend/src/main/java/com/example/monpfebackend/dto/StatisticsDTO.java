package com.example.monpfebackend.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO pour représenter les statistiques complètes pour le tableau de bord
 */
public class StatisticsDTO {

    // Statistiques globales des tickets
    private TicketStatisticsDTO globalStats;
    
    // Statistiques par projet (groupeId -> nombre de tickets)
    private Map<Long, Integer> ticketsByProject;
    private Map<String, Integer> ticketsByProjectName;
    
    // Statistiques par priorité
    private Map<String, Integer> ticketsByUrgency;
    
    // Pourcentage des tickets par groupe de projet
    private Map<String, Double> ticketsPercentageByProject;
    
    // Pourcentage des tickets par statut pour chaque projet
    // Format: Map<nomProjet, Map<statut, pourcentage>>
    private Map<String, Map<String, Double>> statusPercentageByProject;
    
    // Types d'interventions récurrentes (top 5)
    private List<Map<String, Object>> recurringInterventions;

    public StatisticsDTO() {
    }

    // Getters et Setters
    public TicketStatisticsDTO getGlobalStats() {
        return globalStats;
    }

    public void setGlobalStats(TicketStatisticsDTO globalStats) {
        this.globalStats = globalStats;
    }

    public Map<Long, Integer> getTicketsByProject() {
        return ticketsByProject;
    }

    public void setTicketsByProject(Map<Long, Integer> ticketsByProject) {
        this.ticketsByProject = ticketsByProject;
    }

    public Map<String, Integer> getTicketsByProjectName() {
        return ticketsByProjectName;
    }

    public void setTicketsByProjectName(Map<String, Integer> ticketsByProjectName) {
        this.ticketsByProjectName = ticketsByProjectName;
    }

    public Map<String, Integer> getTicketsByUrgency() {
        return ticketsByUrgency;
    }

    public void setTicketsByUrgency(Map<String, Integer> ticketsByUrgency) {
        this.ticketsByUrgency = ticketsByUrgency;
    }

    public Map<String, Double> getTicketsPercentageByProject() {
        return ticketsPercentageByProject;
    }

    public void setTicketsPercentageByProject(Map<String, Double> ticketsPercentageByProject) {
        this.ticketsPercentageByProject = ticketsPercentageByProject;
    }

    public Map<String, Map<String, Double>> getStatusPercentageByProject() {
        return statusPercentageByProject;
    }

    public void setStatusPercentageByProject(Map<String, Map<String, Double>> statusPercentageByProject) {
        this.statusPercentageByProject = statusPercentageByProject;
    }

    public List<Map<String, Object>> getRecurringInterventions() {
        return recurringInterventions;
    }

    public void setRecurringInterventions(List<Map<String, Object>> recurringInterventions) {
        this.recurringInterventions = recurringInterventions;
    }
} 