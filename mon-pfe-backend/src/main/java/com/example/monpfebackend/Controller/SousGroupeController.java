package com.example.monpfebackend.Controller;

import com.example.monpfebackend.Entity.SousGroupe;
import com.example.monpfebackend.Service.SousGroupeService;
import com.example.monpfebackend.dto.SousGroupeDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sous-groupes")
@CrossOrigin(origins = "http://localhost:4200")
public class SousGroupeController {

    @Autowired
    private SousGroupeService sousGroupeService;

    @GetMapping
    public ResponseEntity<List<SousGroupeDto>> getAllSousGroupes() {
        List<SousGroupe> sousGroupes = sousGroupeService.getAllSousGroupes();
        List<SousGroupeDto> dtos = sousGroupes.stream()
            .map(SousGroupeDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/groupe/{groupeId}")
    public ResponseEntity<List<SousGroupeDto>> getSousGroupesByGroupeId(@PathVariable Long groupeId) {
        List<SousGroupe> sousGroupes = sousGroupeService.getSousGroupesByGroupeId(groupeId);
        List<SousGroupeDto> dtos = sousGroupes.stream()
            .map(SousGroupeDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SousGroupeDto> getSousGroupeById(@PathVariable Long id) {
        try {
            SousGroupe sousGroupe = sousGroupeService.getSousGroupeById(id);
            return ResponseEntity.ok(new SousGroupeDto(sousGroupe));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createSousGroupe(@RequestBody SousGroupe sousGroupe) {
        try {
            SousGroupe created = sousGroupeService.createSousGroupe(sousGroupe);
            return ResponseEntity.status(HttpStatus.CREATED).body(new SousGroupeDto(created));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la création du sous-groupe");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSousGroupe(@PathVariable Long id, @RequestBody SousGroupe sousGroupe) {
        try {
            sousGroupe.setId(id);
            SousGroupe updated = sousGroupeService.updateSousGroupe(sousGroupe);
            return ResponseEntity.ok(new SousGroupeDto(updated));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la mise à jour du sous-groupe");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSousGroupe(@PathVariable Long id) {
        try {
            sousGroupeService.deleteSousGroupe(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
