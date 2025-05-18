package com.example.monpfebackend.dto;

/**
 * DTO pour représenter les statistiques des tickets
 */
public class TicketStatisticsDTO {

    private int total;
    private int enAttente;
    private int enCours;
    private int traites;
    private int clotures;

    public TicketStatisticsDTO() {
    }

    public TicketStatisticsDTO(int total, int enAttente, int enCours, int traites, int clotures) {
        this.total = total;
        this.enAttente = enAttente;
        this.enCours = enCours;
        this.traites = traites;
        this.clotures = clotures;
    }

    // Getters et Setters
    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getEnAttente() {
        return enAttente;
    }

    public void setEnAttente(int enAttente) {
        this.enAttente = enAttente;
    }

    public int getEnCours() {
        return enCours;
    }

    public void setEnCours(int enCours) {
        this.enCours = enCours;
    }

    public int getTraites() {
        return traites;
    }

    public void setTraites(int traites) {
        this.traites = traites;
    }

    public int getClotures() {
        return clotures;
    }

    public void setClotures(int clotures) {
        this.clotures = clotures;
    }
} 