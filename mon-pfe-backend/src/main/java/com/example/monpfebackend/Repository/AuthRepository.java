package com.example.monpfebackend.Repository;

import com.example.monpfebackend.Entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthRepository extends JpaRepository<Utilisateur, Long> {

    // Rechercher un utilisateur par son email
    Utilisateur findByEmail(String email);
}
