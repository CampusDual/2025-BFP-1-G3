package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationDao extends JpaRepository<Application, Long> {
    boolean existsByCandidateIdAndOfferId(int candidateId, Long offerId);
    List<Application> findByOfferId(Long offerId);
}
