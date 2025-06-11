package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CompanyDTO;

import java.util.List;

public interface ICompanyService {
    //CRUD Operations
    CompanyDTO queryCompany(CompanyDTO companyDTO);
    List<CompanyDTO> queryAllCompanies();
    int insertCompany(CompanyDTO companyDTO);
    int updateCompany(CompanyDTO companyDTO);
    int deleteCompany(CompanyDTO companyDTO);
}
