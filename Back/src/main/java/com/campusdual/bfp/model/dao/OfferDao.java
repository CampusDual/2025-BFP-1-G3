package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface OfferDao extends JpaRepository<Offer, Long> {
    List<Offer> findByCompanyId(int companyId);
    List<Offer> findByActive(int active);
    Page<Offer> findByActive(int active, Pageable pageable);
    
    // Consulta simplificada - obtener ofertas activas que tengan al menos uno de los tech labels especificados
    @Query("SELECT DISTINCT o FROM Offer o " +
           "JOIN o.techLabels tl " +
           "WHERE o.active = 1 " +
           "AND tl.id IN :techLabelIds")
    Page<Offer> findRecommendedOffers(@Param("techLabelIds") Set<Long> techLabelIds, 
                                     Pageable pageable);
}

