package com.campusdual.bfp.controller;


import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/company")
public class CompanyController {

    @Autowired
    private ICompanyService companyService;

    @GetMapping(value = "/testController")
    public String testCompanyController() {
        return "Company controller works!";
    }

    @PostMapping(value = "/get")
    public CompanyDTO queryCompany(@RequestBody CompanyDTO companyDTO) {
        return companyService.queryCompany(companyDTO);
    }

    @GetMapping(value = "/getAll")
    public List<CompanyDTO> queryAllCompanies() {
        return companyService.queryAllCompanies();
    }

    @PostMapping(value = "/add")
    public int addCompany(@RequestBody CompanyDTO companyDTO) {
        return companyService.insertCompany(companyDTO);
    }

    @PutMapping(value = "/update")
    public int updateCompany(@RequestBody CompanyDTO companyDTO) {
        return companyService.updateCompany(companyDTO);
    }

    @DeleteMapping(value = "/delete")
    public int deleteCompany(@RequestBody CompanyDTO companyDTO) {
        return companyService.deleteCompany(companyDTO);
    }
}
