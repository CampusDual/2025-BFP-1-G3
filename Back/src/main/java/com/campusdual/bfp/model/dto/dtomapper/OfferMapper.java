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

    @Mapping(source = "company", target = "companyId", qualifiedByName = "companyToCompanyId")
    OfferDTO toDTO(Offer offer);

    List<OfferDTO> toDTOList(List<Offer> offers);

    @Mapping(source = "companyId", target = "company", qualifiedByName = "companyIdToCompany")
    Offer toEntity(OfferDTO offerDto);

    @Named("companyToCompanyId")
    default Integer companyToCompanyId(Company company) {
        return company != null ? company.getId() : null;
    }

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

