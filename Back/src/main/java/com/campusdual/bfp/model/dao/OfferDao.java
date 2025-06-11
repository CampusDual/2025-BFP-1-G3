package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Contact;
import com.campusdual.bfp.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferDao extends JpaRepository<Offer, Long> {
}

