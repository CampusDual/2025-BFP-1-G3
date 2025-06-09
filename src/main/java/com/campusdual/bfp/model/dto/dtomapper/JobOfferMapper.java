
package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.JobOffer;
import com.campusdual.bfp.model.dto.JobOfferDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface JobOfferMapper {
    JobOfferMapper INSTANCE = Mappers.getMapper(JobOfferMapper.class);
    
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.name", target = "companyName")
    JobOfferDTO toDto(JobOffer jobOffer);
    
    @Mapping(source = "companyId", target = "company.id")
    JobOffer toEntity(JobOfferDTO dto);
    
    List<JobOfferDTO> toDtoList(List<JobOffer> jobOffers);
}