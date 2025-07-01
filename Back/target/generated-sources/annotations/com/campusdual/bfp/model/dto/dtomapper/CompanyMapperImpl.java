package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.CompanyDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-01T08:46:09+0200",
    comments = "version: 1.5.3.Final, compiler: javac, environment: Java 11.0.27 (Eclipse Adoptium)"
)
public class CompanyMapperImpl implements CompanyMapper {

    @Override
    public CompanyDTO toDTO(Company company) {
        if ( company == null ) {
            return null;
        }

        CompanyDTO companyDTO = new CompanyDTO();

        companyDTO.setId( company.getId() );
        companyDTO.setName( company.getName() );
        companyDTO.setEmail( company.getEmail() );

        return companyDTO;
    }

    @Override
    public List<CompanyDTO> toDTOList(List<Company> company) {
        if ( company == null ) {
            return null;
        }

        List<CompanyDTO> list = new ArrayList<CompanyDTO>( company.size() );
        for ( Company company1 : company ) {
            list.add( toDTO( company1 ) );
        }

        return list;
    }

    @Override
    public Company toEntity(CompanyDTO companydto) {
        if ( companydto == null ) {
            return null;
        }

        Company company = new Company();

        company.setId( companydto.getId() );
        company.setName( companydto.getName() );
        company.setEmail( companydto.getEmail() );

        return company;
    }
}
