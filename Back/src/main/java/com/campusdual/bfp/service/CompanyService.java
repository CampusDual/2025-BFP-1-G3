package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("CompanyService")
@Lazy
public class CompanyService implements ICompanyService {

    @Autowired
    private CompanyDao companyDao;


    @Override
    public CompanyDTO queryCompany(CompanyDTO companyDTO) {
        Company company = CompanyMapper.INSTANCE.toEntity(companyDTO);
        return CompanyMapper.INSTANCE.toDTO(companyDao.getReferenceById(company.getId()));
    }

    @Override
    public List<CompanyDTO> queryAllCompanies() {
        return CompanyMapper.INSTANCE.toDTOList(companyDao.findAll());
    }

    @Override
    public int deleteCompany(CompanyDTO companyDTO) {
        int id = companyDTO.getId();
        Company company = CompanyMapper.INSTANCE.toEntity(companyDTO);
        companyDao.delete(company);
        return id;
    }

    @Override
    public int updateCompany(CompanyDTO companyDTO) {
        return insertCompany(companyDTO);
    }

    @Override
    public int insertCompany(CompanyDTO companyDTO) {
        Company company = CompanyMapper.INSTANCE.toEntity(companyDTO);
        companyDao.saveAndFlush(company);
        return company.getId();
    }
}

