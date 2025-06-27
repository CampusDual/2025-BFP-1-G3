package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dto.OfferDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-27T12:00:33+0200",
    comments = "version: 1.5.3.Final, compiler: javac, environment: Java 11.0.27 (Oracle Corporation)"
)
public class OfferMapperImpl implements OfferMapper {

    @Override
    public OfferDTO toDTO(Offer offer) {
        if ( offer == null ) {
            return null;
        }

        OfferDTO offerDTO = new OfferDTO();

        offerDTO.setCompanyId( offerCompanyId( offer ) );
        offerDTO.setCompanyName( offerCompanyName( offer ) );
        offerDTO.setId( offer.getId() );
        offerDTO.setOfferDescription( offer.getOfferDescription() );
        offerDTO.setTitle( offer.getTitle() );

        return offerDTO;
    }

    @Override
    public List<OfferDTO> toDTOList(List<Offer> offers) {
        if ( offers == null ) {
            return null;
        }

        List<OfferDTO> list = new ArrayList<OfferDTO>( offers.size() );
        for ( Offer offer : offers ) {
            list.add( toDTO( offer ) );
        }

        return list;
    }

    @Override
    public Offer toEntity(OfferDTO offerDto) {
        if ( offerDto == null ) {
            return null;
        }

        Offer offer = new Offer();

        offer.setCompany( companyIdToCompany( offerDto.getCompanyId() ) );
        offer.setId( offerDto.getId() );
        offer.setOfferDescription( offerDto.getOfferDescription() );
        offer.setTitle( offerDto.getTitle() );

        return offer;
    }

    private Integer offerCompanyId(Offer offer) {
        if ( offer == null ) {
            return null;
        }
        Company company = offer.getCompany();
        if ( company == null ) {
            return null;
        }
        int id = company.getId();
        return id;
    }

    private String offerCompanyName(Offer offer) {
        if ( offer == null ) {
            return null;
        }
        Company company = offer.getCompany();
        if ( company == null ) {
            return null;
        }
        String name = company.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
