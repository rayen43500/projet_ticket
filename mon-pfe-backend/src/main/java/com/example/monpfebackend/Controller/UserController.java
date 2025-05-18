package com.example.monpfebackend.Controller;

import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Service.UserService;
import com.example.monpfebackend.dto.UtilisateurDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ Récupérer les utilisateurs (optionnellement par rôle)
    @GetMapping
    public ResponseEntity<List<UtilisateurDto>> getUsers(@RequestParam(required = false) String role) {
        List<Utilisateur> utilisateurs;
        
        if (role != null) {
            try {
                Utilisateur.Role userRole = Utilisateur.Role.valueOf(role.toUpperCase());
                utilisateurs = userService.getUsersByRole(userRole);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Rôle invalide : " + role);
            }
        } else {
            utilisateurs = userService.getAllUsers();
        }
        
        // Convert to DTOs
        List<UtilisateurDto> dtos = utilisateurs.stream()
            .map(UtilisateurDto::new)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtos);
    }

    // Récupérer un utilisateur par son ID
    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDto> getUserById(@PathVariable Long id) {
        try {
            Utilisateur utilisateur = userService.getUserById(id);
            return ResponseEntity.ok(new UtilisateurDto(utilisateur));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Ajouter un nouvel utilisateur
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody Utilisateur utilisateur) {
        try {
            Utilisateur saved = userService.addUser(utilisateur);
            return ResponseEntity.status(HttpStatus.CREATED).body(new UtilisateurDto(saved));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la création de l'utilisateur");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Mettre à jour un utilisateur existant
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Utilisateur utilisateur) {
        try {
            utilisateur.setId(id);
            Utilisateur updated = userService.updateUser(utilisateur);
            return ResponseEntity.ok(new UtilisateurDto(updated));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la mise à jour de l'utilisateur");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Supprimer un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Assigner un utilisateur à un groupe
    @PostMapping("/{userId}/groupe/{groupeId}")
    public ResponseEntity<?> assignUserToGroup(@PathVariable Long userId, @PathVariable Long groupeId) {
        try {
            Utilisateur utilisateur = userService.assignUserToGroup(userId, groupeId);
            return ResponseEntity.ok(new UtilisateurDto(utilisateur));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de l'assignation au groupe");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Retirer un utilisateur d'un groupe
    @DeleteMapping("/{userId}/groupe")
    public ResponseEntity<?> removeUserFromGroup(@PathVariable Long userId) {
        try {
            Utilisateur utilisateur = userService.removeUserFromGroup(userId);
            return ResponseEntity.ok(new UtilisateurDto(utilisateur));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors du retrait du groupe");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
