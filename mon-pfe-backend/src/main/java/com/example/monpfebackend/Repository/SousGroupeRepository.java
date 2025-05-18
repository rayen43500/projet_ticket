package com.example.monpfebackend.Repository;

import com.example.monpfebackend.Entity.SousGroupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface SousGroupeRepository extends JpaRepository<SousGroupe, Long> {

    // Récupérer tous les sous-groupes d’un groupe donné
    List<SousGroupe> findByGroupeId(Long groupeId);

    // Optionnel : Récupérer un sous-groupe par son nom
    SousGroupe findByNom(String nom);
}
