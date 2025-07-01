package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.OfferDTO;

import java.util.List;

public interface IOfferService {
    OfferDTO queryOffer(OfferDTO offerDto);
    List<OfferDTO> queryAllOffers();
    List<OfferDTO> getOffersByCompanyId(int companyId);
    long insertOffer(OfferDTO offerDto);
    long insertSecureOffer(OfferDTO offerDto, String username);  // Método seguro
    long updateOffer(OfferDTO offerDto);
    long deleteOffer(OfferDTO offerDto);
    boolean toggleActiveStatus(Long id);
}
