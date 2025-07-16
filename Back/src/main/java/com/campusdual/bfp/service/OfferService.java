package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Application;
import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.ApplicationDao;
import com.campusdual.bfp.model.dao.TechLabelsDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import com.campusdual.bfp.model.dto.dtomapper.TechLabelsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import java.time.LocalDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service("OfferService")
@Transactional
public class OfferService implements IOfferService {
    @Autowired
    private OfferDao offerDao;

    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private UserDao userDao;
    
    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private ApplicationDao applicationDao;

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
    public OfferDTO getOfferById(Long id) {
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
    public Object queryAllOffersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Solo obtener ofertas activas (active = 1)
        Page<Offer> offerPage = offerDao.findByActive(1, pageable);
        
        // Asegurar que las relaciones company estén cargadas
        offerPage.getContent().forEach(offer -> {
            if(offer.getCompany() != null) {
                offer.getCompany().getName();
            }
        });
        
        List<OfferDTO> offerDTOs = OfferMapper.INSTANCE.toDTOList(offerPage.getContent());
        
        // Crear respuesta con información de paginación
        Map<String, Object> response = new HashMap<>();
        response.put("offers", offerDTOs);
        response.put("currentPage", offerPage.getNumber());
        response.put("totalPages", offerPage.getTotalPages());
        response.put("totalElements", offerPage.getTotalElements());
        response.put("size", offerPage.getSize());
        
        return response;
    }

    @Override
    public List<OfferDTO> queryActiveOffers() {
        List<Offer> activeOffers = offerDao.findByActive(1);
        // Asegurar que las relaciones company estén cargadas
        activeOffers.forEach(offer -> {
            if(offer.getCompany() != null) {
                offer.getCompany().getName();
            }
        });
        return OfferMapper.INSTANCE.toDTOList(activeOffers);
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
            
            // Asegurar que el publishingDate esté establecido
            if (offer.getPublishingDate() == null) {
                offer.setPublishingDate(LocalDateTime.now());
            }
            
            // Debug: Verificar que el publishingDate está establecido
            System.out.println("DEBUG - Publishing Date before save: " + offer.getPublishingDate());
            
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

    @Override
    public Object getRecommendedOffersPaginated(String username, int page, int size) {
        try {
            // Buscar el usuario por login (username)
            User user = userDao.findByLogin(username);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuario no encontrado");
                return errorResponse;
            }

            // Obtener el candidato asociado al usuario
            Candidate candidate = user.getCandidate();
            if (candidate == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "El usuario no es un candidato");
                return errorResponse;
            }

            // Obtener las tech labels del candidato
            Set<TechLabels> candidateTechLabels = candidate.getTechLabels();
            if (candidateTechLabels.isEmpty()) {
                // Si el candidato no tiene tech labels, devolver todas las ofertas activas
                Pageable pageable = PageRequest.of(page, size);
                Page<Offer> offerPage = offerDao.findByActive(1, pageable);
                
                List<OfferDTO> offerDtos = offerPage.getContent().stream()
                    .map(OfferMapper.INSTANCE::toDTO)
                    .collect(Collectors.toList());

                Map<String, Object> result = new HashMap<>();
                result.put("offers", offerDtos);
                result.put("totalElements", offerPage.getTotalElements());
                result.put("totalPages", offerPage.getTotalPages());
                result.put("currentPage", page);
                result.put("size", size);
                result.put("message", "No tienes áreas de especialización definidas. Mostrando todas las ofertas activas.");
                return result;
            }

            // Extraer los IDs de las tech labels del candidato
            Set<Long> techLabelIds = candidateTechLabels.stream()
                .map(TechLabels::getId)
                .collect(Collectors.toSet());

            System.out.println("🔍 DEBUG - Tech Labels del candidato: " + techLabelIds);

            // Obtener TODAS las ofertas recomendadas sin paginación para poder ordenar por afinidad
            Pageable allResultsPageable = PageRequest.of(0, Integer.MAX_VALUE);
            Page<Offer> allRecommendedOffers = offerDao.findRecommendedOffers(
                techLabelIds, 
                allResultsPageable
            );

            System.out.println("📊 DEBUG - Ofertas encontradas con tech labels coincidentes: " + allRecommendedOffers.getTotalElements());

            // Obtener las aplicaciones del candidato para filtrar ofertas ya aplicadas
            List<Application> candidateApplications = applicationDao.findByCandidateId(candidate.getId());
            Set<Long> appliedOfferIds = candidateApplications.stream()
                .map(app -> app.getOffer().getId())
                .collect(Collectors.toSet());

            System.out.println("🚫 DEBUG - Ofertas ya aplicadas por el candidato: " + appliedOfferIds);

            // Filtrar ofertas a las que ya se aplicó y ordenar por afinidad
            List<Offer> sortedOffers = allRecommendedOffers.getContent().stream()
                .filter(offer -> !appliedOfferIds.contains(offer.getId()))
                .sorted((offer1, offer2) -> {
                    // Contar tech labels coincidentes para cada oferta
                    long matches1 = offer1.getTechLabels().stream()
                        .mapToLong(tl -> techLabelIds.contains(tl.getId()) ? 1 : 0)
                        .sum();
                    long matches2 = offer2.getTechLabels().stream()
                        .mapToLong(tl -> techLabelIds.contains(tl.getId()) ? 1 : 0)
                        .sum();
                    
                    System.out.println("⚖️ DEBUG - Oferta " + offer1.getId() + " tiene " + matches1 + " coincidencias, Oferta " + offer2.getId() + " tiene " + matches2 + " coincidencias");
                    
                    // Ordenar descendente (más coincidencias primero)
                    return Long.compare(matches2, matches1);
                })
                .collect(Collectors.toList());

            System.out.println("✅ DEBUG - Total de ofertas recomendadas después del filtrado: " + sortedOffers.size());

            // Aplicar paginación manual
            int totalElements = sortedOffers.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, totalElements);

            List<Offer> paginatedOffers = new ArrayList<>();
            if (fromIndex < totalElements) {
                paginatedOffers = sortedOffers.subList(fromIndex, toIndex);
            }

            // Convertir las ofertas paginadas a DTOs
            List<OfferDTO> offerDtos = paginatedOffers.stream()
                .map(OfferMapper.INSTANCE::toDTO)
                .collect(Collectors.toList());

            // Crear la respuesta con información de paginación
            Map<String, Object> result = new HashMap<>();
            result.put("offers", offerDtos);
            result.put("totalElements", totalElements);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            result.put("size", size);
            result.put("message", "Ofertas recomendadas ordenadas por afinidad con tus áreas de especialización");

            return result;
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener ofertas recomendadas: " + e.getMessage());
            return errorResponse;
        }
    }
}
