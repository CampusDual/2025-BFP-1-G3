package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

@Mapper
public interface OfferMapper {
    
    OfferMapper INSTANCE = Mappers.getMapper(OfferMapper.class);
    
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.name", target = "companyName")
    @Mapping(source = "techLabels", target = "techLabels", qualifiedByName = "techLabelsSetToList")
    OfferDTO toDTO(Offer offer);
    
    List<OfferDTO> toDTOList(List<Offer> offers);

    @Mapping(source = "companyId", target = "company", qualifiedByName = "companyIdToCompany")
    @Mapping(source = "techLabels", target = "techLabels", qualifiedByName = "techLabelsListToSet")
    Offer toEntity(OfferDTO offerDto);
    
    @Named("companyIdToCompany")
    default Company companyIdToCompany(Integer companyId) {
        if (companyId == null) {
            return null;
        }
        Company company = new Company();
        company.setId(companyId);
        return company;
    }
    
    @Named("techLabelsSetToList")
    default List<TechLabelsDTO> techLabelsSetToList(Set<TechLabels> techLabels) {
        if (techLabels == null) {
            return List.of();
        }
        return techLabels.stream()
                .map(this::techLabelToDTO)
                .collect(Collectors.toList());
    }
    
    @Named("techLabelsListToSet")
    default Set<TechLabels> techLabelsListToSet(List<TechLabelsDTO> techLabelsDTO) {
        if (techLabelsDTO == null) {
            return new HashSet<>();
        }
        return techLabelsDTO.stream()
                .map(this::techLabelDTOToEntity)
                .collect(Collectors.toSet());
    }
    
    default TechLabelsDTO techLabelToDTO(TechLabels techLabel) {
        if (techLabel == null) {
            return null;
        }
        return new TechLabelsDTO(techLabel.getId(), techLabel.getName());
    }
    
    default TechLabels techLabelDTOToEntity(TechLabelsDTO techLabelDTO) {
        if (techLabelDTO == null) {
            return null;
        }
        TechLabels techLabel = new TechLabels();
        techLabel.setId(techLabelDTO.getId());
        techLabel.setName(techLabelDTO.getName());
        return techLabel;
    }
}