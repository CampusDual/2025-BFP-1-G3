package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IJobApplicationService;
import com.campusdual.bfp.model.dto.JobApplicationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-applications")
public class JobApplicationController {

    @Autowired
    private IJobApplicationService jobApplicationService;

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_candidate') and authentication.principal.id == #candidateId)")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByCandidate(@PathVariable Integer candidateId) {
        List<JobApplicationDTO> applications = jobApplicationService.queryApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/job-offer/{jobOfferId}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and @jobOfferService.queryJobOffer(T(com.campusdual.bfp.model.dto.JobOfferDTO).new().setId(#jobOfferId)).companyId == authentication.principal.company.id)")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByJobOffer(@PathVariable Long jobOfferId) {
        List<JobApplicationDTO> applications = jobApplicationService.queryApplicationsByJobOffer(jobOfferId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasRole('role_admin') or (hasRole('role_company') and authentication.principal.company.id == #companyId)")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByCompany(@PathVariable Long companyId) {
        List<JobApplicationDTO> applications = jobApplicationService.queryApplicationsByCompany(companyId);
        return ResponseEntity.ok(applications);
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('role_candidate')")
    public ResponseEntity<String> applyToJobOffer(@RequestBody JobApplicationDTO jobApplicationDTO, Authentication authentication) {
        // Asegurar que el candidateId sea el del usuario autenticado
        // jobApplicationDTO.setCandidateId(((User) authentication.getPrincipal()).getId());
        
        int result = jobApplicationService.applyToJobOffer(jobApplicationDTO);
        if (result == 1) {
            return ResponseEntity.ok("Aplicación enviada exitosamente");
        } else if (result == -1) {
            return ResponseEntity.badRequest().body("Ya has aplicado a esta oferta");
        }
        return ResponseEntity.badRequest().body("Error al enviar la aplicación");
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('role_admin') or hasRole('role_company')")
    public ResponseEntity<String> updateApplicationStatus(@PathVariable Long id, @RequestBody JobApplicationDTO jobApplicationDTO) {
        jobApplicationDTO.setId(id);
        int result = jobApplicationService.updateApplicationStatus(jobApplicationDTO);
        return result == 1 ? 
            ResponseEntity.ok("Estado actualizado exitosamente") : 
            ResponseEntity.badRequest().body("Error al actualizar el estado");
    }

    @GetMapping("/check/{jobOfferId}/{candidateId}")
    @PreAuthorize("hasRole('role_candidate') and authentication.principal.id == #candidateId")
    public ResponseEntity<Boolean> hasUserApplied(@PathVariable Long jobOfferId, @PathVariable Integer candidateId) {
        boolean hasApplied = jobApplicationService.hasUserApplied(jobOfferId, candidateId);
        return ResponseEntity.ok(hasApplied);
    }
}