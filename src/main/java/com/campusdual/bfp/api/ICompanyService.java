package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CompanyDTO;
import java.util.List;

public interface ICompanyService {
    CompanyDTO queryCompany(CompanyDTO companyDTO);
    List<CompanyDTO> queryAllCompanies();
    int insertCompany(CompanyDTO companyDTO);
    int updateCompany(CompanyDTO companyDTO);
    int deleteCompany(CompanyDTO companyDTO);
    CompanyDTO findByCif(String cif);
    CompanyDTO findByEmail(String email);
}