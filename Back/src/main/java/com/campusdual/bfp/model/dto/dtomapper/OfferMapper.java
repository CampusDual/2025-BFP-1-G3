package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface OfferMapper {
    
    OfferMapper INSTANCE = Mappers.getMapper(OfferMapper.class);
    
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.name", target = "companyName")
    OfferDTO toDTO(Offer offer);
    
    List<OfferDTO> toDTOList(List<Offer> offers);
    
    @Mapping(source = "companyId", target = "company", qualifiedByName = "companyIdToCompany")
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
}