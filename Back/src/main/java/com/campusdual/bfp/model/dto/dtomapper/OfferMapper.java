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
    
    /**
     * Convierte una entidad Offer a OfferDTO
     * Mapea automáticamente los campos coincidentes y usa métodos custom para relaciones complejas
     */
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.name", target = "companyName")
    @Mapping(source = "techLabels", target = "techLabels", qualifiedByName = "techLabelsSetToList")
    OfferDTO toDTO(Offer offer);
    
    /**
     * Convierte una lista de entidades Offer a lista de OfferDTO usando el mapping completo
     */
    default List<OfferDTO> toDTOList(List<Offer> offers) {
        if (offers == null || offers.isEmpty()) {
            return List.of();
        }
        return offers.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte una lista de entidades Offer a lista de OfferDTO básicos (sin tech labels)
     * Útil para listados donde no se necesitan las etiquetas técnicas
     */
    default List<OfferDTO> toBasicDTOList(List<Offer> offers) {
        if (offers == null || offers.isEmpty()) {
            return List.of();
        }
        return offers.stream()
                .map(this::toBasicDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Conversión básica sin cargar tech labels - útil para listados rápidos
     * donde no se necesitan las etiquetas técnicas
     */
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.name", target = "companyName")
    @Mapping(target = "techLabels", ignore = true)
    OfferDTO toBasicDTO(Offer offer);

    /**
     * Convierte un OfferDTO a entidad Offer
     * Ignora publishingDate ya que se establece automáticamente en el servicio
     */
    @Mapping(source = "companyId", target = "company", qualifiedByName = "companyIdToCompany")
    @Mapping(source = "techLabels", target = "techLabels", qualifiedByName = "techLabelsListToSet")
    @Mapping(target = "publishingDate", ignore = true)
    Offer toEntity(OfferDTO offerDto);
    
    /**
     * Convierte un ID de compañía a una entidad Company con solo el ID seteado
     * Útil para establecer relaciones sin cargar la entidad completa
     */
    @Named("companyIdToCompany")
    default Company companyIdToCompany(Integer companyId) {
        if (companyId == null) {
            return null;
        }
        Company company = new Company();
        company.setId(companyId);
        return company;
    }
    
    /**
     * Convierte un Set de TechLabels a List de TechLabelsDTO
     * Utilizado en la conversión de entidad a DTO
     */
    @Named("techLabelsSetToList")
    default List<TechLabelsDTO> techLabelsSetToList(Set<TechLabels> techLabels) {
        if (techLabels == null || techLabels.isEmpty()) {
            return List.of();
        }
        return techLabels.stream()
                .map(this::techLabelToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte una List de TechLabelsDTO a Set de TechLabels
     * Utilizado en la conversión de DTO a entidad
     */
    @Named("techLabelsListToSet")
    default Set<TechLabels> techLabelsListToSet(List<TechLabelsDTO> techLabelsDTO) {
        if (techLabelsDTO == null || techLabelsDTO.isEmpty()) {
            return new HashSet<>();
        }
        return techLabelsDTO.stream()
                .map(this::techLabelDTOToEntity)
                .collect(Collectors.toSet());
    }
    
    /**
     * Convierte una entidad TechLabels a TechLabelsDTO
     */
    default TechLabelsDTO techLabelToDTO(TechLabels techLabel) {
        if (techLabel == null) {
            return null;
        }
        return new TechLabelsDTO(techLabel.getId(), techLabel.getName());
    }
    
    /**
     * Convierte un TechLabelsDTO a entidad TechLabels
     */
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