package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.ICandidateService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController()
@RequestMapping("/candidate")
public class CandidateController {

    private static final Logger logger = LoggerFactory.getLogger(CandidateController.class);

    @Autowired
    private ICandidateService candidateService;

    @Autowired
    private UserService userService;

    @Autowired
    private JWTUtil jwtUtil;

    @GetMapping(value = "/testController")
    public String testCandidateController() {
        return "Candidate controller works!";
    }

    /**
     * Endpoint seguro para que un candidato obtenga su propio perfil
     * Solo candidatos autenticados pueden acceder a SUS PROPIOS datos
     */
    @GetMapping(value = "/profile")
    public ResponseEntity<CandidateDTO> getCandidateProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // 1. Extraer el token del header "Authorization: Bearer <token>"
            String token = authHeader.substring(7); // Remover "Bearer " para obtener solo el token
            
            // 2. Usar JWT para obtener el nombre de usuario del token (sin consultar la BD)
            String username = jwtUtil.getUsernameFromToken(token);
            
            // 3. Usar JWT para obtener el rol del usuario del token
            String role = jwtUtil.getRoleFromToken(token);
            
            // 4. Log de debug para ver qué usuario está intentando acceder
            logger.debug("DEBUG - Username: {}", username);
            logger.debug("DEBUG - Role: '{}'", role);
            logger.debug("DEBUG - Role length: {}", (role != null ? role.length() : "null"));
            
            // 5. SEGURIDAD: Verificar que el usuario tenga rol de candidato
            if (role == null || !role.equals("role_candidate")) {
                // Si no es candidato, denegar acceso y registrar intento sospechoso
                logger.warn("User {} with role '{}' attempted to access candidate profile", username, role);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // 6. Obtener el ID del candidato asociado al usuario autenticado
            // Esto busca en la tabla User la relación con Candidate
            Integer candidateId = userService.getCandidateIdByUsername(username);
            
            // 7. FALLBACK: Si no encuentra la relación User->Candidate, intentar buscar por email
            // (Esto es para casos donde el login del usuario es el email del candidato)
            if (candidateId == null) {
                logger.warn("No candidate found for user via User relationship: {}, trying by email", username);
                
                // Buscar en la lista de todos los candidatos uno que tenga el email igual al username
                CandidateDTO candidateByEmail = null;
                try {
                    // Obtener todos los candidatos del sistema
                    List<CandidateDTO> allCandidates = candidateService.queryAllCandidates();
                    // Filtrar para encontrar el que tiene email = username
                    candidateByEmail = allCandidates.stream()
                        .filter(c -> username.equals(c.getEmail()))
                        .findFirst()
                        .orElse(null);
                } catch (Exception e) {
                    // Manejo de errores si no se puede buscar por email
                    logger.error("Error searching candidate by email: {}", e.getMessage());
                }
                
                // 8. Si encontramos candidato por email, usar ese ID
                if (candidateByEmail != null) {
                    candidateId = candidateByEmail.getId();
                    logger.info("Found candidate by email: {} -> candidateId: {}", username, candidateId);
                } else {
                    // 9. Si no encontramos candidato ni por User ni por email, denegar acceso
                    logger.warn("No candidate found for user by email either: {}", username);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
            }
            
            // 10. Crear un DTO con el ID del candidato para la consulta
            CandidateDTO candidateDTO = new CandidateDTO();
            candidateDTO.setId(candidateId);
            
            // 11. Obtener los datos completos del candidato usando método seguro
            // Este método usa findById() en lugar de getReferenceById() para evitar errores
            CandidateDTO result = getCandidateSafely(candidateId);
            if (result == null) {
                logger.warn("No candidate found with ID: {}", candidateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            // 12. Log de auditoría y retornar los datos
            logger.info("Candidate {} accessed their own profile", username);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            // 13. Manejo de errores generales (token inválido, etc.)
            logger.error("Error getting candidate profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint seguro para que un candidato actualice su propio perfil
     * Solo permite actualizar SUS PROPIOS datos, no los de otros candidatos
     */
    @PutMapping(value = "/profile")
    public ResponseEntity<Integer> updateCandidateProfile(@RequestBody CandidateDTO candidateDTO, 
                                                         @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // 1. Extraer el token del header "Authorization: Bearer <token>"
            String token = authHeader.substring(7); // Remover "Bearer " para obtener solo el token
            
            // 2. Usar JWT para obtener el nombre de usuario y rol del token
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // 3. Log de debug para diagnóstico
            logger.debug("DEBUG - Username: {}", username);
            logger.debug("DEBUG - Role: '{}'", role);
            
            // 4. SEGURIDAD: Verificar que el usuario sea un candidato
            if (role == null || !role.equals("role_candidate")) {
                // Si no es candidato, denegar acceso
                logger.warn("User {} with role '{}' attempted to update candidate profile", username, role);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
            }
            
            // 5. Obtener el ID del candidato del usuario autenticado
            Integer candidateId = userService.getCandidateIdByUsername(username);
            
            // 6. FALLBACK: Si no encuentra la relación, buscar por email
            if (candidateId == null) {
                logger.warn("No candidate found for user via User relationship: {}, trying by email", username);
                
                // Buscar candidato por email como método alternativo
                CandidateDTO candidateByEmail = null;
                try {
                    List<CandidateDTO> allCandidates = candidateService.queryAllCandidates();
                    candidateByEmail = allCandidates.stream()
                        .filter(c -> username.equals(c.getEmail()))
                        .findFirst()
                        .orElse(null);
                } catch (Exception e) {
                    logger.error("Error searching candidate by email: {}", e.getMessage());
                }
                
                if (candidateByEmail != null) {
                    candidateId = candidateByEmail.getId();
                    logger.info("Found candidate by email for update: {} -> candidateId: {}", username, candidateId);
                } else {
                    logger.warn("No candidate found for user by email either: {}", username);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(-1);
                }
            }
            
            // 7. SEGURIDAD CRÍTICA: Forzar que el DTO use el ID del usuario autenticado
            // Esto previene que el usuario envíe un ID diferente y modifique otros perfiles
            candidateDTO.setId(candidateId);
            
            // 8. Actualizar el perfil usando el servicio
            try {
                int result = candidateService.updateCandidate(candidateDTO);
                logger.info("Candidate {} updated their own profile", username);
                return ResponseEntity.ok(result);
            } catch (Exception updateException) {
                logger.error("Error updating candidate profile for ID {}: {}", candidateId, updateException.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
            }
            
        } catch (Exception e) {
            logger.error("Error updating candidate profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
        }
    }

    /**
     * Endpoint temporal de debug para diagnosticar el problema
     */
    @GetMapping(value = "/debug")
    public ResponseEntity<String> debugCandidateProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            StringBuilder debug = new StringBuilder();
            debug.append("DEBUG INFO:\n");
            debug.append("Username: ").append(username).append("\n");
            debug.append("Role: '").append(role).append("'\n");
            debug.append("Role length: ").append(role != null ? role.length() : "null").append("\n");
            
            // Verificar si el usuario existe
            Integer candidateId = userService.getCandidateIdByUsername(username);
            debug.append("CandidateId from UserService: ").append(candidateId).append("\n");
            
            // Verificar si el rol es correcto
            if (role != null && role.equals("role_candidate")) {
                debug.append("Role validation: PASSED\n");
            } else {
                debug.append("Role validation: FAILED\n");
            }
            
            return ResponseEntity.ok(debug.toString());
            
        } catch (Exception e) {
            logger.error("Error in debug endpoint: {}", e.getMessage(), e);
            return ResponseEntity.ok("ERROR: " + e.getMessage() + "\nStackTrace: " + e.getStackTrace()[0]);
        }
    }

    /**
     * Método auxiliar para obtener candidato de forma segura
     */
    private CandidateDTO getCandidateSafely(int candidateId) {
        try {
            // Crear DTO con el ID para consultar usando el servicio corregido
            CandidateDTO candidateDTO = new CandidateDTO();
            candidateDTO.setId(candidateId);
            
            // Usar el servicio corregido que ahora maneja findById() correctamente
            CandidateDTO result = candidateService.queryCandidate(candidateDTO);
            return result; // Puede ser null si no se encuentra
        } catch (Exception e) {
            logger.error("Error getting candidate safely for ID {}: {}", candidateId, e.getMessage());
            return null;
        }
    }

    /**
     * Endpoint simplificado para debug y solución temporal
     */
    @GetMapping(value = "/simple-profile")
    public ResponseEntity<String> getSimpleProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Verificar que sea un candidato
            if (role == null || !role.equals("role_candidate")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid role: " + role);
            }
            
            // Obtener el candidateId del usuario autenticado
            Integer candidateId = userService.getCandidateIdByUsername(username);
            if (candidateId == null) {
                return ResponseEntity.ok("User found but no candidateId associated");
            }
            
            // Intentar obtener todos los candidatos y filtrar
            try {
                List<CandidateDTO> allCandidates = candidateService.queryAllCandidates();
                
                Optional<CandidateDTO> candidate = allCandidates.stream()
                    .filter(c -> c.getId() == candidateId)
                    .findFirst();
                
                if (candidate.isPresent()) {
                    CandidateDTO found = candidate.get();
                    return ResponseEntity.ok("SUCCESS: Found candidate - ID: " + found.getId() + 
                        ", Name: " + found.getName() + ", Email: " + found.getEmail());
                } else {
                    return ResponseEntity.ok("CandidateId " + candidateId + " exists in UserService but not found in candidates list. Total candidates: " + allCandidates.size());
                }
                
            } catch (Exception e) {
                return ResponseEntity.ok("Error calling queryAllCandidates: " + e.getMessage());
            }
            
        } catch (Exception e) {
            return ResponseEntity.ok("General error: " + e.getMessage());
        }
    }

    // Los siguientes endpoints están disponibles solo para administradores
    // Se mantienen por compatibilidad pero con validación de rol administrativa

    /**
     * Endpoint POST /get - MODIFICADO para ser seguro
     * ANTES: Cualquier usuario podía enviar cualquier candidateId y ver otros perfiles
     * DESPUÉS: Solo candidatos pueden ver SUS PROPIOS datos, admins pueden ver todos
     */
    @PostMapping(value = "/get")
    public ResponseEntity<CandidateDTO> queryCandidate(@RequestBody CandidateDTO candidateDTO, 
                                                       @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // 1. Extraer token y obtener información del usuario autenticado
            String token = authHeader.substring(7);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // 2. CASO 1: Si es admin, permitir acceso completo (para funciones administrativas)
            if ("ROLE_ADMIN".equals(role)) {
                // Los admins pueden consultar cualquier candidato por ID
                return ResponseEntity.ok(candidateService.queryCandidate(candidateDTO));
            }
            
            // 3. CASO 2: Si es candidato, solo permitir acceso a SUS PROPIOS datos
            if ("role_candidate".equals(role)) {
                // 3a. Obtener el ID del candidato del usuario autenticado
                Integer authenticatedCandidateId = userService.getCandidateIdByUsername(username);
                
                // 3b. Verificar que existe la relación User->Candidate
                if (authenticatedCandidateId == null) {
                    logger.warn("User {} has role_candidate but no candidate relationship found", username);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
                
                // 3c. SEGURIDAD CRÍTICA: Verificar que no está intentando acceder a otros datos
                // Si el frontend envía un ID diferente al suyo, denegar acceso
                if (candidateDTO.getId() > 0 && candidateDTO.getId() != authenticatedCandidateId.intValue()) {
                    logger.warn("User {} attempted to access candidate data for ID {} but owns ID {}", 
                              username, candidateDTO.getId(), authenticatedCandidateId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
                
                // 3d. FORZAR el ID correcto: siempre usar el ID del usuario autenticado
                // Esto previene cualquier manipulación desde el frontend
                candidateDTO.setId(authenticatedCandidateId);
                
                // 3e. Obtener los datos usando el ID autenticado
                CandidateDTO result = candidateService.queryCandidate(candidateDTO);
                if (result == null) {
                    logger.warn("No candidate found for authenticated user {} with ID {}", username, authenticatedCandidateId);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
                
                // 3f. Log de auditoría y retornar datos
                logger.info("Candidate {} accessed their own data via /get endpoint", username);
                return ResponseEntity.ok(result);
            }
            
            // 4. CASO 3: Cualquier otro rol - denegar acceso
            logger.warn("User {} with role '{}' attempted unauthorized access to candidate data", username, role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            
        } catch (Exception e) {
            // 5. Manejo de errores (token inválido, errores de BD, etc.)
            logger.error("Error in queryCandidate: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/getAll")
    public ResponseEntity<List<CandidateDTO>> queryAllCandidates(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Solo permitir a administradores
            if (!"ROLE_ADMIN".equals(role)) {
                logger.warn("User {} with role '{}' attempted to access all candidates list", username, role);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(candidateService.queryAllCandidates());
            
        } catch (Exception e) {
            logger.error("Error in admin queryAllCandidates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/add")
    public ResponseEntity<Integer> addCandidate(@RequestBody CandidateDTO candidateDTO, 
                                               @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Solo permitir a administradores
            if (!"ROLE_ADMIN".equals(role)) {
                logger.warn("User {} with role '{}' attempted to add candidate directly", username, role);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
            }
            
            int result = candidateService.insertCandidate(candidateDTO);
            logger.info("Admin {} created new candidate with ID: {}", username, result);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error in admin addCandidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
        }
    }

    @PutMapping(value = "/update")
    public ResponseEntity<Integer> updateCandidate(@RequestBody CandidateDTO candidateDTO, 
                                                  @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Solo permitir a administradores
            if (!"ROLE_ADMIN".equals(role)) {
                logger.warn("User {} with role '{}' attempted to update candidate directly", username, role);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
            }
            
            int result = candidateService.updateCandidate(candidateDTO);
            logger.info("Admin {} updated candidate with ID: {}", username, candidateDTO.getId());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error in admin updateCandidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
        }
    }

    @DeleteMapping(value = "/delete")
    public ResponseEntity<Integer> deleteCandidate(@RequestBody CandidateDTO candidateDTO, 
                                                  @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Solo permitir a administradores
            if (!"ROLE_ADMIN".equals(role)) {
                logger.warn("User {} with role '{}' attempted to delete candidate", username, role);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(-1);
            }
            
            int result = candidateService.deleteCandidate(candidateDTO);
            logger.warn("Admin {} deleted candidate with ID: {}", username, candidateDTO.getId());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error in admin deleteCandidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
        }
    }
}
