package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IJobOfferService;
import com.campusdual.bfp.model.dto.JobOfferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-offers")
public class JobOfferController {

    @Autowired
    private IJobOfferService jobOfferService;

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDTO> getJobOffer(@PathVariable Long id) {
        JobOfferDTO jobOfferDTO = new JobOfferDTO();
        jobOfferDTO.setId(id);
        JobOfferDTO result = jobOfferService.queryJobOffer(jobOfferDTO);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<JobOfferDTO>> getAllActiveJobOffers() {
        List<JobOfferDTO> jobOffers = jobOfferService.queryActiveJobOffers();
        return ResponseEntity.ok(jobOffers);
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobOfferDTO>> searchJobOffers(@RequestParam String keyword) {
        List<JobOfferDTO> jobOffers = jobOfferService.searchJobOffers(keyword);
        return ResponseEntity.ok(jobOffers);
    }

    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and authentication.principal.company.id == #companyId)")
    public ResponseEntity<List<JobOfferDTO>> getJobOffersByCompany(@PathVariable Long companyId) {
        List<JobOfferDTO> jobOffers = jobOfferService.queryJobOffersByCompany(companyId);
        return ResponseEntity.ok(jobOffers);
    }

    @PostMapping
    @PreAuthorize("hasRole('role_company')")
    public ResponseEntity<String> createJobOffer(@RequestBody JobOfferDTO jobOfferDTO, Authentication authentication) {
        // Aquí deberías obtener la companyId del usuario autenticado
        // jobOfferDTO.setCompanyId(((User) authentication.getPrincipal()).getCompany().getId());
        
        int result = jobOfferService.insertJobOffer(jobOfferDTO);
        return result == 1 ? 
            ResponseEntity.ok("Oferta creada exitosamente") : 
            ResponseEntity.badRequest().body("Error al crear la oferta");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and @jobOfferService.queryJobOffer(T(com.campusdual.bfp.model.dto.JobOfferDTO).new().setId(#id)).companyId == authentication.principal.company.id)")
    public ResponseEntity<String> updateJobOffer(@PathVariable Long id, @RequestBody JobOfferDTO jobOfferDTO) {
        jobOfferDTO.setId(id);
        int result = jobOfferService.updateJobOffer(jobOfferDTO);
        return result == 1 ? 
            ResponseEntity.ok("Oferta actualizada exitosamente") : 
            ResponseEntity.badRequest().body("Error al actualizar la oferta");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and @jobOfferService.queryJobOffer(T(com.campusdual.bfp.model.dto.JobOfferDTO).new().setId(#id)).companyId == authentication.principal.company.id)")
    public ResponseEntity<String> deleteJobOffer(@PathVariable Long id) {
        JobOfferDTO jobOfferDTO = new JobOfferDTO();
        jobOfferDTO.setId(id);
        int result = jobOfferService.deleteJobOffer(jobOfferDTO);
        return result == 1 ? 
            ResponseEntity.ok("Oferta eliminada exitosamente") : 
            ResponseEntity.badRequest().body("Error al eliminar la oferta");
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and @jobOfferService.queryJobOffer(T(com.campusdual.bfp.model.dto.JobOfferDTO).new().setId(#id)).companyId == authentication.principal.company.id)")
    public ResponseEntity<String> closeJobOffer(@PathVariable Long id) {
        int result = jobOfferService.closeJobOffer(id);
        return result == 1 ? 
            ResponseEntity.ok("Oferta cerrada exitosamente") : 
            ResponseEntity.badRequest().body("Error al cerrar la oferta");
    }
}