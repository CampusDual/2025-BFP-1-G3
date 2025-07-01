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
}
