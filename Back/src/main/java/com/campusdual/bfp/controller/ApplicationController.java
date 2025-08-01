package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import com.campusdual.bfp.model.dto.ApplicationSummaryDTO;
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
    private UserDao userDao;

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

    /**
     * ENDPOINT CRÍTICO MODIFICADO: /add
     * 
     * PROBLEMA ORIGINAL: Recibía candidateId desde el frontend (VULNERABLE)
     * SOLUCIÓN: Obtiene candidateId del token JWT del usuario autenticado (SEGURO)
     */
    @PostMapping(value = "/add")
    public ResponseEntity<?> addApplication(@RequestBody ApplicationDTO applicationDTO,
                                           @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // 1. Extraer el token JWT del header "Authorization: Bearer <token>"
            String token = authHeader.substring(7); // Remover "Bearer " para obtener solo el token
            
            // 2. Usar JWT para obtener información del usuario autenticado
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // 3. Debug logging para diagnóstico
            System.out.println("DEBUG - Username: " + username);
            System.out.println("DEBUG - Role: '" + role + "'");
            System.out.println("DEBUG - Role length: " + (role != null ? role.length() : "null"));
            
            // 4. SEGURIDAD CRÍTICA: Verificar que el usuario sea un candidato
            // Solo candidatos pueden aplicar a ofertas de trabajo
            if (role == null || (!role.equals("role_candidate") && !role.equalsIgnoreCase("role_candidate"))) {
                System.out.println("DEBUG - Role validation failed. Expected 'role_candidate', got: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo los candidatos pueden aplicar a ofertas. Rol actual: " + role);
            }
            
            // 5. MÉTODO SEGURO: Llamar al servicio que obtiene candidateId del username
            // En lugar de confiar en el applicationDTO.candidateId del frontend,
            // el servicio busca el candidateId real del usuario autenticado
            long applicationId = applicationService.insertSecureApplication(applicationDTO, username);
            
            // 6. Devolver el ID de la aplicación creada
            return ResponseEntity.ok(applicationId);
            
        } catch (Exception e) {
            // 7. Manejo de errores (token inválido, candidato no encontrado, etc.)
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

    @PutMapping("/toggleActive/{id}")
    public ResponseEntity<String> toggleActive(@PathVariable Long id, @RequestBody ApplicationDTO applicationDTO) {
        int updated = applicationService.toggleActiveStatus(id, applicationDTO);
        if (updated == 1) {
            return ResponseEntity.ok("Estado cambiado con éxito, aceptado.");
        } else  if (updated == 2) {
            return ResponseEntity.ok("Estado cambiado con éxito, rechazado.");
        } else if (updated == 0) {
            return ResponseEntity.ok("Estado cambiado con éxito, pendiente.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //Obtener ofertas de un candidato
    @PostMapping("/getAplicationsByCandidate")
    public List<ApplicationSummaryDTO> queryAplicationsByCandidate(
            @RequestHeader("Authorization") String token) {

        String login = jwtUtil.getUsernameFromToken(token.substring(7));
        return applicationService.queryAplicationsByCandidate(login);
    }

    // Endpoint para verificar si un candidato ya está inscrito en una oferta
    @GetMapping("/check/{candidateId}/{offerId}")
    public ResponseEntity<?> checkApplicationExists(@PathVariable Integer candidateId, 
                                                   @PathVariable Long offerId,
                                                   @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String role = jwtUtil.getRoleFromToken(token);
            
            // Verificar que sea un candidato
            if (role == null || (!role.equals("role_candidate") && !role.equalsIgnoreCase("role_candidate"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo los candidatos pueden verificar aplicaciones");
            }
            
            // Verificar si ya existe la aplicación
            boolean exists = applicationService.checkApplicationExists(candidateId, offerId);
            
            return ResponseEntity.ok(new CheckApplicationResponse(exists));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al verificar la aplicación: " + e.getMessage());
        }
    }
    
    // Clase helper para la respuesta del check
    public static class CheckApplicationResponse {
        private boolean exists;
        
        public CheckApplicationResponse(boolean exists) {
            this.exists = exists;
        }
        
        public boolean isExists() {
            return exists;
        }
        
        public void setExists(boolean exists) {
            this.exists = exists;
        }
    }
}
