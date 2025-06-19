package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Application;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface ApplicationMapper {

    ApplicationMapper INSTANCE = Mappers.getMapper(ApplicationMapper.class);

    // Convierte Application → ApplicationDTO
    @Mapping(source = "candidate.id", target = "id_candidate")
    @Mapping(source = "offer.id", target = "id_offer")
    ApplicationDTO toDTO(Application application);

    List<ApplicationDTO> toDTOList(List<Application> applications);

    // Convierte ApplicationDTO → Application
    @Mapping(source = "id_candidate", target = "candidate", qualifiedByName = "idCandidateToCandidate")
    @Mapping(source = "id_offer", target = "offer", qualifiedByName = "idOfferToOffer")
    Application toEntity(ApplicationDTO applicationDTO);

    @Named("idCandidateToCandidate")
    default Candidate idCandidateToCandidate(Integer id_candidate) {
        if (id_candidate == null) return null;
        Candidate candidate = new Candidate();
        candidate.setId(id_candidate);
        return candidate;
    }

    @Named("idOfferToOffer")
    default Offer idOfferToOffer(Integer id_offer) {
        if (id_offer == null) return null;
        Offer offer = new Offer();
        offer.setId(id_offer.longValue()); // conversión si tu DTO usa Integer pero el ID en Offer es Long
        return offer;
    }
}