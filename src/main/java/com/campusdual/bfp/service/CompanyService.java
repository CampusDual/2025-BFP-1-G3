package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("CompanyService")
@Lazy
public class CompanyService implements ICompanyService {

    @Autowired
    private CompanyDao companyDao;

    @Override
    public CompanyDTO queryCompany(CompanyDTO companyDTO) {
        if (companyDTO.getId() == null) return null;
        
        Optional<Company> company = companyDao.findById(companyDTO.getId());
        return company.map(this::entityToDto).orElse(null);
    }

    @Override
    public List<CompanyDTO> queryAllCompanies() {
        return companyDao.findAll().stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public int insertCompany(CompanyDTO companyDTO) {
        try {
            Company company = dtoToEntity(companyDTO);
            company.setCreatedAt(LocalDateTime.now());
            companyDao.save(company);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public int updateCompany(CompanyDTO companyDTO) {
        try {
            if (companyDTO.getId() == null) return 0;
            
            Optional<Company> existing = companyDao.findById(companyDTO.getId());
            if (existing.isPresent()) {
                Company company = existing.get();
                updateEntityFromDto(company, companyDTO);
                companyDao.save(company);
                return 1;
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public int deleteCompany(CompanyDTO companyDTO) {
        try {
            if (companyDTO.getId() == null) return 0;
            companyDao.deleteById(companyDTO.getId());
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public CompanyDTO findByCif(String cif) {
        Optional<Company> company = companyDao.findByCif(cif);
        return company.map(this::entityToDto).orElse(null);
    }

    @Override
    public CompanyDTO findByEmail(String email) {
        Optional<Company> company = companyDao.findByEmail(email);
        return company.map(this::entityToDto).orElse(null);
    }

    // MÉTODOS DE CONVERSIÓN
    private CompanyDTO entityToDto(Company company) {
        if (company == null) return null;
        
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setEmail(company.getEmail());
        dto.setCif(company.getCif());
        dto.setDescription(company.getDescription());
        dto.setWebsite(company.getWebsite());
        dto.setLocation(company.getLocation());
        dto.setSector(company.getSector());
        dto.setPhone(company.getPhone());
        dto.setAddress(company.getAddress());
        dto.setCreatedAt(company.getCreatedAt());
        return dto;
    }
    
    private Company dtoToEntity(CompanyDTO dto) {
        if (dto == null) return null;
        
        Company company = new Company();
        company.setId(dto.getId());
        company.setName(dto.getName());
        company.setEmail(dto.getEmail());
        company.setCif(dto.getCif());
        company.setDescription(dto.getDescription());
        company.setWebsite(dto.getWebsite());
        company.setLocation(dto.getLocation());
        company.setSector(dto.getSector());
        company.setPhone(dto.getPhone());
        company.setAddress(dto.getAddress());
        company.setCreatedAt(dto.getCreatedAt());
        return company;
    }
    
    private void updateEntityFromDto(Company company, CompanyDTO dto) {
        if (dto.getName() != null) company.setName(dto.getName());
        if (dto.getEmail() != null) company.setEmail(dto.getEmail());
        if (dto.getCif() != null) company.setCif(dto.getCif());
        if (dto.getDescription() != null) company.setDescription(dto.getDescription());
        if (dto.getWebsite() != null) company.setWebsite(dto.getWebsite());
        if (dto.getLocation() != null) company.setLocation(dto.getLocation());
        if (dto.getSector() != null) company.setSector(dto.getSector());
        if (dto.getPhone() != null) company.setPhone(dto.getPhone());
        if (dto.getAddress() != null) company.setAddress(dto.getAddress());
    }
}