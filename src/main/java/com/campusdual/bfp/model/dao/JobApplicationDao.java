package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.JobApplication;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationDao extends JpaRepository<JobApplication, Long> {
    
    List<JobApplication> findByCandidate(User candidate);
    
    List<JobApplication> findByJobOffer(JobOffer jobOffer);
    
    Optional<JobApplication> findByJobOfferAndCandidate(JobOffer jobOffer, User candidate);
    
    boolean existsByJobOfferAndCandidate(JobOffer jobOffer, User candidate);
    
    @Query("SELECT ja FROM JobApplication ja WHERE ja.jobOffer.company.id = :companyId ORDER BY ja.appliedAt DESC")
    List<JobApplication> findApplicationsByCompanyId(@Param("companyId") Long companyId);
    
    @Query("SELECT ja FROM JobApplication ja WHERE ja.candidate.id = :candidateId ORDER BY ja.appliedAt DESC")
    List<JobApplication> findApplicationsByCandidateId(@Param("candidateId") Integer candidateId);
}