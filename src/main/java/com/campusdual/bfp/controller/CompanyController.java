package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    @Autowired
    private ICompanyService companyService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('role_admin') or hasRole('role_company')")
    public ResponseEntity<CompanyDTO> getCompany(@PathVariable Long id) {
        CompanyDTO companyDTO = new CompanyDTO();
        companyDTO.setId(id);
        CompanyDTO result = companyService.queryCompany(companyDTO);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companies = companyService.queryAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @PostMapping
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<String> createCompany(@RequestBody CompanyDTO companyDTO) {
        int result = companyService.insertCompany(companyDTO);
        if (result == 1) {
            return ResponseEntity.ok("Empresa creada exitosamente");
        } else if (result == -1) {
            return ResponseEntity.badRequest().body("Ya existe una empresa con ese CIF o email");
        }
        return ResponseEntity.badRequest().body("Error al crear la empresa");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and @companyService.queryCompany(T(com.campusdual.bfp.model.dto.CompanyDTO).new().setId(#id)).id == authentication.principal.company.id)")
    public ResponseEntity<String> updateCompany(@PathVariable Long id, @RequestBody CompanyDTO companyDTO) {
        companyDTO.setId(id);
        int result = companyService.updateCompany(companyDTO);
        return result == 1 ? 
            ResponseEntity.ok("Empresa actualizada exitosamente") : 
            ResponseEntity.badRequest().body("Error al actualizar la empresa");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<String> deleteCompany(@PathVariable Long id) {
        CompanyDTO companyDTO = new CompanyDTO();
        companyDTO.setId(id);
        int result = companyService.deleteCompany(companyDTO);
        return result == 1 ? 
            ResponseEntity.ok("Empresa eliminada exitosamente") : 
            ResponseEntity.badRequest().body("Error al eliminar la empresa");
    }

    @GetMapping("/by-cif/{cif}")
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<CompanyDTO> getCompanyByCif(@PathVariable String cif) {
        CompanyDTO result = companyService.findByCif(cif);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }
}