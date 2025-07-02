package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.TechLabelsDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import com.campusdual.bfp.model.dto.dtomapper.TechLabelsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service("OfferService")
@Lazy
@Transactional
public class OfferService implements IOfferService {
    @Autowired
    private OfferDao offerDao;

    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TechLabelsDao techLabelsDao;

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
    public List<OfferDTO> getOffersByCompanyId(int companyId) {
        List<Offer> offers = offerDao.findByCompanyId(companyId);
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
    public long insertSecureOffer(OfferDTO offerDto, String username) {
        try {
            // Buscar el usuario por username
            User user = userDao.findByLogin(username);
            if (user == null) {
                throw new RuntimeException("Usuario no encontrado");
            }

            // Obtener la empresa desde la relación User -> Company
            Company company = user.getCompany();
            if (company == null) {
                throw new RuntimeException("Usuario no está asociado a ninguna empresa");
            }

            Integer authenticatedCompanyId = company.getId();
            
            // Debug: Imprimir los valores para diagnosticar
            System.out.println("DEBUG - Username: " + username);
            System.out.println("DEBUG - Authenticated Company ID: " + authenticatedCompanyId);
            System.out.println("DEBUG - Requested Company ID: " + offerDto.getCompanyId());

            // SEGURIDAD: Ignorar cualquier companyId enviado desde el frontend
            // y usar solo el de la empresa autenticada
            offerDto.setCompanyId(authenticatedCompanyId);
            
            // Verificar que la empresa existe (redundante pero por seguridad)
            if (!companyDao.existsById(authenticatedCompanyId)) {
                throw new RuntimeException("La empresa autenticada no existe en la base de datos");
            }

            Offer offer = OfferMapper.INSTANCE.toEntity(offerDto);
            offerDao.saveAndFlush(offer);
            return offer.getId();
            
        } catch (Exception e) {
            throw new RuntimeException("Error al crear la oferta: " + e.getMessage());
        }
    }

    @Override
    public long updateOffer(OfferDTO offerDto) {
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

    public boolean toggleActiveStatus(Long id) {
        Optional<Offer> optionalOffer = offerDao.findById(id);
        if (optionalOffer.isPresent()) {
            Offer offer = optionalOffer.get();
            offer.setActive(offer.getActive() == 1 ? 0 : 1); // Alternamos
            offerDao.saveAndFlush(offer);
            return true;
        }
        return false;
    }

    @Override
    public boolean addLabelToOffer(Long offerId, Long labelId) {
        try {
            Optional<Offer> offerOpt = offerDao.findById(offerId);
            Optional<TechLabels> labelOpt = techLabelsDao.findById(labelId);
            
            if (offerOpt.isPresent() && labelOpt.isPresent()) {
                Offer offer = offerOpt.get();
                TechLabels label = labelOpt.get();
                
                // Verificar el límite máximo de 5 etiquetas
                if (offer.getTechLabels().size() >= 5) {
                    return false;
                }
                
                offer.addTechLabel(label);
                offerDao.saveAndFlush(offer);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean removeLabelFromOffer(Long offerId, Long labelId) {
        try {
            Optional<Offer> offerOpt = offerDao.findById(offerId);
            Optional<TechLabels> labelOpt = techLabelsDao.findById(labelId);
            
            if (offerOpt.isPresent() && labelOpt.isPresent()) {
                Offer offer = offerOpt.get();
                TechLabels label = labelOpt.get();
                
                offer.removeTechLabel(label);
                offerDao.saveAndFlush(offer);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<TechLabelsDTO> getOfferLabels(Long offerId) {
        Optional<Offer> offerOpt = offerDao.findById(offerId);
        if (offerOpt.isPresent()) {
            Offer offer = offerOpt.get();
            return offer.getTechLabels().stream()
                    .map(TechLabelsMapper.INSTANCE::toDTO)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Override
    public boolean updateOfferLabels(Long offerId, List<Long> labelIds) {
        try {
            Optional<Offer> offerOpt = offerDao.findById(offerId);
            if (!offerOpt.isPresent()) {
                return false;
            }
            
            // Verificar el límite máximo de 5 etiquetas
            if (labelIds.size() > 5) {
                return false;
            }
            
            Offer offer = offerOpt.get();
            
            // Limpiar etiquetas existentes
            offer.getTechLabels().clear();
            
            // Agregar las nuevas etiquetas
            Set<TechLabels> newLabels = new HashSet<>();
            for (Long labelId : labelIds) {
                Optional<TechLabels> labelOpt = techLabelsDao.findById(labelId);
                if (labelOpt.isPresent()) {
                    newLabels.add(labelOpt.get());
                }
            }
            
            offer.setTechLabels(newLabels);
            offerDao.saveAndFlush(offer);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
