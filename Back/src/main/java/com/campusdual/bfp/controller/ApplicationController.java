package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private IApplicationService applicationService;

    @Autowired
    private JWTUtil jwtUtil;

    @PostMapping(value = "/get")
    public ApplicationDTO queryApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.queryApplication(applicationDTO);
    }

    @GetMapping(value = "/getAll")
    public List<ApplicationDTO> queryAllApplications() {
        return applicationService.queryAllApplications();
    }

    @PostMapping(value = "/add")
    public ResponseEntity<?> addApplication(@RequestBody ApplicationDTO applicationDTO, 
                                           @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Debug: Imprimir los valores para diagnosticar
            System.out.println("DEBUG - Username: " + username);
            System.out.println("DEBUG - Role: '" + role + "'");
            System.out.println("DEBUG - Role length: " + (role != null ? role.length() : "null"));
            
            // Verificar que sea un candidato - ajustado para roles con prefijo
            if (role == null || (!role.equals("role_candidate") && !role.equalsIgnoreCase("role_candidate"))) {
                System.out.println("DEBUG - Role validation failed. Expected 'role_candidate', got: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo los candidatos pueden aplicar a ofertas. Rol actual: " + role);
            }
            
            // Llamar al servicio con seguridad
            long applicationId = applicationService.insertSecureApplication(applicationDTO, username);
            
            return ResponseEntity.ok(applicationId);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al procesar la aplicación: " + e.getMessage());
        }
    }

    @PutMapping(value = "/update")
    public long updateApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.updateApplication(applicationDTO);
    }

    @DeleteMapping(value = "/delete")
    public long deleteApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.deleteApplication(applicationDTO);
    }
}
