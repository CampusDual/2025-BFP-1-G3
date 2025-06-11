package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.OfferDTO;

import java.util.List;

public interface IOfferService {
    OfferDTO queryOffer(OfferDTO offerDto);
    List<OfferDTO> queryAllOffers();
    long insertOffer(OfferDTO offerDto);
    long updateOffer(OfferDTO offerDto);
    long deleteOffer(OfferDTO offerDto);
}
