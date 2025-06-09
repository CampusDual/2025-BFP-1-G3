package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOfferDao extends JpaRepository<JobOffer, Long> {
    
    // Buscar ofertas activas por status
    List<JobOffer> findByStatus(JobOffer.JobOfferStatus status);
    
    // Método para ofertas activas
    @Query("SELECT jo FROM JobOffer jo WHERE jo.status = 'ACTIVE'")
    List<JobOffer> findByActiveTrue();
    
    // Buscar por company id
    List<JobOffer> findByCompanyId(Long companyId);
    
    // Búsqueda por texto
    List<JobOffer> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String title, String description);
}