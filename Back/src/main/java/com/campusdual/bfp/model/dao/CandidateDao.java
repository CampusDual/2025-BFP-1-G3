package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateDao extends JpaRepository<Candidate, Integer> {
    // Método para buscar candidato por email
    Candidate findByEmail(String email);
}
