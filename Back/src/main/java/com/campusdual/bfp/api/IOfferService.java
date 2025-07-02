package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TechLabelsDTO;

import java.util.List;

public interface IOfferService {
    OfferDTO queryOffer(OfferDTO offerDto);
    List<OfferDTO> queryAllOffers();
    List<OfferDTO> getOffersByCompanyId(int companyId);
    long insertOffer(OfferDTO offerDto);
    long insertSecureOffer(OfferDTO offerDto, String username);
    long updateOffer(OfferDTO offerDto);
    long deleteOffer(OfferDTO offerDto);
    boolean toggleActiveStatus(Long id);
    
    // Nuevos métodos para manejar etiquetas
    boolean addLabelToOffer(Long offerId, Long labelId);
    boolean removeLabelFromOffer(Long offerId, Long labelId);
    List<TechLabelsDTO> getOfferLabels(Long offerId);
    boolean updateOfferLabels(Long offerId, List<Long> labelIds);
}
