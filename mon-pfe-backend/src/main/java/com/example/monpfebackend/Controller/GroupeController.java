package com.example.monpfebackend.Controller;

import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Service.GroupeService;
import com.example.monpfebackend.dto.GroupeDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groupes")
@CrossOrigin(origins = "http://localhost:4200")
public class GroupeController {

    @Autowired
    private GroupeService groupeService;

    @PostMapping
    public ResponseEntity<?> createGroupe(@RequestBody Groupe groupe, @RequestParam List<Long> intervenantIds) {
        try {
            Groupe createdGroupe = groupeService.createGroupe(groupe, intervenantIds);
            return ResponseEntity.status(HttpStatus.CREATED).body(new GroupeDto(createdGroupe));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la création du groupe");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroupe(@PathVariable Long id,
                                               @RequestBody Groupe groupe,
                                               @RequestParam List<Long> intervenantIds) {
        try {
            groupe.setId(id);
            Groupe updatedGroupe = groupeService.updateGroupe(groupe, intervenantIds);
            return ResponseEntity.ok(new GroupeDto(updatedGroupe));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la mise à jour du groupe");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<List<GroupeDto>> getAllGroupes(@RequestParam(required = false) Optional<Long> intervenantIds) {
        List<Groupe> groupes = groupeService.getAllGroupes();
        
        // Filter by intervenantId if provided
        if (intervenantIds.isPresent()) {
            Long intervenantId = intervenantIds.get();
            groupes = groupes.stream()
                    .filter(groupe -> groupe.getIntervenants().stream()
                            .anyMatch(intervenant -> intervenant.getId().equals(intervenantId)))
                    .collect(Collectors.toList());
        }
        
        List<GroupeDto> dtos = groupes.stream().map(GroupeDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroupe(@PathVariable Long id) {
        groupeService.deleteGroupe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupeDto> getGroupeById(@PathVariable Long id) {
        Groupe groupe = groupeService.getGroupeById(id);
        return ResponseEntity.ok(new GroupeDto(groupe));
    }
}