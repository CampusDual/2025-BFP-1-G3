package com.campusdual.bfp.controller;


import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/company")
public class CompanyController {

    private static final Logger logger = LoggerFactory.getLogger(CompanyController.class);

    @Autowired
    private ICompanyService companyService;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/testController")
    public String testCompanyController() {
        return "Company controller works!";
    }

    @PostMapping(value = "/get")
    public ResponseEntity<CompanyDTO> queryCompany(@RequestBody CompanyDTO companyDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized access attempt to get company data");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        logger.debug("User {} with role {} attempting to get company data for ID: {}", username, role, companyDTO.getId());

        // Solo permitir acceso a admin o a la propia empresa
        if ("role_admin".equals(role)) {
            return ResponseEntity.ok(companyService.queryCompany(companyDTO));
        } else if ("role_company".equals(role)) {
            Integer userCompanyId = userService.getCompanyIdByUsername(username);
            if (userCompanyId != null && userCompanyId == companyDTO.getId()) {
                return ResponseEntity.ok(companyService.queryCompany(companyDTO));
            } else {
                logger.warn("Company {} attempted to access data for company ID: {}", username, companyDTO.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else {
            logger.warn("User {} with invalid role {} attempted to access company data", username, role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping(value = "/getAll")
    public ResponseEntity<List<CompanyDTO>> queryAllCompanies(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized access attempt to get all companies");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        // Solo permitir acceso a administradores y candidatos (para ver ofertas disponibles)
        if ("role_admin".equals(role) || "role_candidate".equals(role)) {
            return ResponseEntity.ok(companyService.queryAllCompanies());
        } else {
            logger.warn("User {} with role {} attempted to access all companies list", authentication.getName(), role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping(value = "/add")
    public ResponseEntity<Integer> addCompany(@RequestBody CompanyDTO companyDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized access attempt to add company");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        // Solo permitir a administradores crear empresas directamente
        if (!"role_admin".equals(role)) {
            logger.warn("User {} with role {} attempted to add company directly", authentication.getName(), role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
        }

        int result = companyService.insertCompany(companyDTO);
        logger.info("Admin {} created new company with ID: {}", authentication.getName(), result);
        return ResponseEntity.ok(result);
    }

    @PutMapping(value = "/update")
    public ResponseEntity<Integer> updateCompany(@RequestBody CompanyDTO companyDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized access attempt to update company");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        logger.debug("User {} with role {} attempting to update company ID: {}", username, role, companyDTO.getId());

        // Permitir acceso a admin o a la propia empresa
        if ("role_admin".equals(role)) {
            int result = companyService.updateCompany(companyDTO);
            logger.info("Admin {} updated company with ID: {}", username, companyDTO.getId());
            return ResponseEntity.ok(result);
        } else if ("role_company".equals(role)) {
            Integer userCompanyId = userService.getCompanyIdByUsername(username);
            if (userCompanyId != null && userCompanyId == companyDTO.getId()) {
                int result = companyService.updateCompany(companyDTO);
                logger.info("Company {} updated their own profile", username);
                return ResponseEntity.ok(result);
            } else {
                logger.warn("Company {} attempted to update company ID: {} (own ID: {})", username, companyDTO.getId(), userCompanyId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
            }
        } else {
            logger.warn("User {} with invalid role {} attempted to update company", username, role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
        }
    }

    @DeleteMapping(value = "/delete")
    public ResponseEntity<Integer> deleteCompany(@RequestBody CompanyDTO companyDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized access attempt to delete company");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        logger.debug("User {} with role {} attempting to delete company ID: {}", username, role, companyDTO.getId());

        // Solo permitir a administradores eliminar empresas
        if (!"role_admin".equals(role)) {
            logger.warn("User {} with role {} attempted to delete company", username, role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
        }

        int result = companyService.deleteCompany(companyDTO);
        logger.warn("Admin {} deleted company with ID: {}", username, companyDTO.getId());
        return ResponseEntity.ok(result);
    }
}
