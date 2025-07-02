package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.OfferLabel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferLabelDao extends JpaRepository<OfferLabel, Long> {
    
    List<OfferLabel> findByOfferId(Long offerId);
    
    List<OfferLabel> findByTechLabelId(Long techLabelId);
    
    @Modifying
    @Query("DELETE FROM OfferLabel ol WHERE ol.offer.id = :offerId")
    void deleteByOfferId(@Param("offerId") Long offerId);
    
    @Query("SELECT ol FROM OfferLabel ol WHERE ol.offer.id = :offerId AND ol.techLabel.id = :techLabelId")
    OfferLabel findByOfferIdAndTechLabelId(@Param("offerId") Long offerId, @Param("techLabelId") Long techLabelId);
}
