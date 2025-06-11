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
        return OfferMapper.INSTANCE.toDTOList(offerDao.findAll());
    }

    @Override
    public long insertOffer(OfferDTO offerDto) {
        Integer companyId = offerDto.getCompanyId();
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
