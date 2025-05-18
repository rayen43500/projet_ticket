package com.example.monpfebackend.Controller;

import com.example.monpfebackend.Service.TicketService;
import com.example.monpfebackend.dto.StatisticsDTO;
import com.example.monpfebackend.dto.TicketStatisticsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    @Autowired
    private TicketService ticketService;

    // Obtenir les statistiques basiques des tickets
    @GetMapping("/tickets")
    public ResponseEntity<TicketStatisticsDTO> getTicketStats() {
        return ResponseEntity.ok(ticketService.getTicketStatistics());
    }
    
    // Obtenir les statistiques complètes pour le tableau de bord
    @GetMapping("/dashboard")
    public ResponseEntity<StatisticsDTO> getDashboardStatistics() {
        return ResponseEntity.ok(ticketService.getComprehensiveStatistics());
    }
} 