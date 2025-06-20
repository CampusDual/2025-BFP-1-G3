package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferDao extends JpaRepository<Offer, Long> {
    List<Offer> findByCompanyId(int companyId);

}

