package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Contact;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.ContactMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("OfferService")
@Lazy
@Transactional
public class OfferService implements IOfferService {
    @Autowired
    private OfferDao offerDao;

    @Autowired
    private CompanyDao companyDao;

    @Override
    public OfferDTO queryOffer(OfferDTO offerDto) {
        Long id = offerDto.getId();
        return offerDao.findById(id)
                .map(OfferMapper.INSTANCE::toDTO)
                .orElse(null);
    }

    @Override
    public List<OfferDTO> queryAllOffers() {
        List<Offer> offers = offerDao.findAll();
        // Asegurarse de que la relación company esté cargada con JPA (esto podría ser redundante si ya está configurado con EAGER)
        offers.forEach(offer -> {
            if(offer.getCompany() != null) {
                // Forzar carga de company si es necesario
                offer.getCompany().getName();
            }
        });
        return OfferMapper.INSTANCE.toDTOList(offers);
    }

    @Override
    public long insertOffer(OfferDTO offerDto) {
        Integer companyId = offerDto.getCompanyId();
        if (companyId == null || !companyDao.existsById(companyId)) {
            throw new IllegalArgumentException("Company with id " + companyId + " does not exist");
        }
        Offer offer = OfferMapper.INSTANCE.toEntity(offerDto);
        offerDao.saveAndFlush(offer);
        return offer.getId();
    }

    @Override
    public long updateOffer(OfferDTO offerDto) {
        Long id = offerDto.getId();
        Offer offer = OfferMapper.INSTANCE.toEntity(offerDto);
        offerDao.saveAndFlush(offer);
        return offer.getId();
    }

    @Override
    public long deleteOffer(OfferDTO offerDto) {
        long id = offerDto.getId();
        Offer offer = OfferMapper.INSTANCE.toEntity(offerDto);
        offerDao.delete(offer);
        return id;
    }
}
