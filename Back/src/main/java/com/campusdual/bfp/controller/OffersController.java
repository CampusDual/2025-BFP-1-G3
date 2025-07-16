package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.WorkType;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import com.campusdual.bfp.model.dto.UpdateOfferLabelsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;

@RestController()
@RequestMapping("/offers")
public class OffersController {
    @Autowired
    private IOfferService offersService;

    @Autowired
    private IApplicationService applicationService;

    @Autowired
    private JWTUtil jwtUtil;

    @PostMapping(value = "/get")
    public OfferDTO queryOffer(@RequestBody OfferDTO offerDto) {
        return offersService.queryOffer(offerDto);
    }

    @GetMapping(value = "/getAll")
    public List<OfferDTO> queryAllOffers() {
        return offersService.queryAllOffers();
    }

    @GetMapping(value = "/getPaginated")
    public ResponseEntity<?> queryAllOffersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            return ResponseEntity.ok(offersService.queryAllOffersPaginated(page, size));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener ofertas paginadas: " + e.getMessage());
        }
    }

    @GetMapping(value = "/getActive")
    public List<OfferDTO> queryActiveOffers() {
        return offersService.queryActiveOffers();
    }

    @GetMapping(value = "/recommended")
    public ResponseEntity<?> getRecommendedOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            // Verificar que sea un candidato
            if (role == null || (!role.equals("role_candidate") && !role.equalsIgnoreCase("role_candidate"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo los candidatos pueden acceder a ofertas recomendadas. Rol actual: " + role);
            }

            // Obtener ofertas recomendadas
            Object result = offersService.getRecommendedOffersPaginated(username, page, size);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener ofertas recomendadas: " + e.getMessage());
        }
    }

    @GetMapping("/getOffersByCompany/{companyId}")
    public List<OfferDTO> getOffersByCompanyId(@PathVariable int companyId) {
        return offersService.getOffersByCompanyId(companyId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferDTO> getOfferById(@PathVariable Long id) {
        OfferDTO offer = offersService.getOfferById(id);
        if (offer != null) {
            return ResponseEntity.ok(offer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/add")
    public ResponseEntity<?> addOffer(@RequestBody OfferDTO offerDto,
                                     @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            // Debug: Imprimir los valores para diagnosticar
            System.out.println("DEBUG - Username: " + username);
            System.out.println("DEBUG - Role: '" + role + "'");

            // Verificar que sea una empresa
            if (role == null || (!role.equals("role_company") && !role.equalsIgnoreCase("role_company"))) {
                System.out.println("DEBUG - Role validation failed. Expected 'role_company', got: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo las empresas pueden crear ofertas. Rol actual: " + role);
            }

            // Llamar al servicio con seguridad
            long offerId = offersService.insertSecureOffer(offerDto, username);

            return ResponseEntity.ok(offerId);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al crear la oferta: " + e.getMessage());
        }
    }

    @PutMapping(value = "/update")
    public ResponseEntity<?> updateOffer(@RequestBody OfferDTO offerDto,
                                       @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String role = jwtUtil.getRoleFromToken(token);
            Integer userCompanyId = jwtUtil.getCompanyIdFromToken(token);

            // Debug logs
            System.out.println("DEBUG - Update Offer - Role: " + role);
            System.out.println("DEBUG - Update Offer - User Company ID from token: " + userCompanyId);
            System.out.println("DEBUG - Update Offer - Offer ID to update: " + offerDto.getId());

            // Verificar que sea una empresa
            if (role == null || (!role.equals("role_company") && !role.equalsIgnoreCase("role_company"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo las empresas pueden modificar ofertas. Rol actual: " + role);
            }

            // Verificar que el companyId esté en el token
            if (userCompanyId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Token inválido: no se pudo identificar la empresa");
            }

            // Obtener la oferta actual para verificar propiedad
            OfferDTO existingOffer = offersService.queryOffer(offerDto);
            if (existingOffer == null) {
                return ResponseEntity.notFound().build();
            }

            // Debug log para ver la oferta existente
            System.out.println("DEBUG - Update Offer - Existing offer company ID: " + existingOffer.getCompanyId());

            // Verificar que la empresa sea dueña de la oferta
            if (!existingOffer.getCompanyId().equals(userCompanyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes modificar tus propias ofertas de trabajo. Tu empresa ID: " + userCompanyId + ", Oferta empresa ID: " + existingOffer.getCompanyId());
            }

            long result = offersService.updateOffer(offerDto);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace(); // Imprimir stack trace completo
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al actualizar la oferta: " + e.getMessage());
        }
    }

    @DeleteMapping(value = "/delete")
    public ResponseEntity<?> deleteOffer(@RequestBody OfferDTO offerDto,
                                        @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String role = jwtUtil.getRoleFromToken(token);
            Integer userCompanyId = jwtUtil.getCompanyIdFromToken(token);

            // Verificar que sea una empresa
            if (role == null || (!role.equals("role_company") && !role.equalsIgnoreCase("role_company"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo las empresas pueden eliminar ofertas. Rol actual: " + role);
            }

            // Verificar que el companyId esté en el token
            if (userCompanyId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Token inválido: no se pudo identificar la empresa");
            }

            // Obtener la oferta actual para verificar propiedad
            OfferDTO existingOffer = offersService.queryOffer(offerDto);
            if (existingOffer == null) {
                return ResponseEntity.notFound().build();
            }

            // Verificar que la empresa sea dueña de la oferta
            if (!existingOffer.getCompanyId().equals(userCompanyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes eliminar tus propias ofertas de trabajo");
            }

            long result = offersService.deleteOffer(offerDto);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al eliminar la oferta: " + e.getMessage());
        }
    }

    @GetMapping("/{offerId}/candidates")
    public List<ApplicationDTO> getCandidatesByOfferId(@PathVariable int offerId) {
        return applicationService.getCandidatesByOfferId(offerId);
    }

    @PutMapping("/toggleActive/{id}")
    public ResponseEntity<String> toggleActive(@PathVariable Long id,
                                             @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String role = jwtUtil.getRoleFromToken(token);
            Integer userCompanyId = jwtUtil.getCompanyIdFromToken(token);

            // Verificar que sea una empresa
            if (role == null || (!role.equals("role_company") && !role.equalsIgnoreCase("role_company"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo las empresas pueden cambiar el estado de ofertas");
            }

            // Verificar que el companyId esté en el token
            if (userCompanyId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Token inválido: no se pudo identificar la empresa");
            }

            // Obtener la oferta para verificar propiedad
            OfferDTO offerCheck = new OfferDTO();
            offerCheck.setId(id);
            OfferDTO existingOffer = offersService.queryOffer(offerCheck);
            if (existingOffer == null) {
                return ResponseEntity.notFound().build();
            }

            // Verificar que la empresa sea dueña de la oferta
            if (!existingOffer.getCompanyId().equals(userCompanyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes cambiar el estado de tus propias ofertas");
            }

            boolean updated = offersService.toggleActiveStatus(id);
            if (updated) {
                return ResponseEntity.ok("Estado 'active' cambiado con éxito.");
            } else {
                return ResponseEntity.badRequest().body("Error al cambiar el estado");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al cambiar el estado de la oferta: " + e.getMessage());
        }
    }

    // Nuevos endpoints para manejar etiquetas de ofertas
    @PostMapping("/{offerId}/labels/{labelId}")
    public ResponseEntity<String> addLabelToOffer(@PathVariable Long offerId, @PathVariable Long labelId,
                                                 @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Verificar autorización
            if (!isAuthorizedToModifyOffer(offerId, authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes modificar las etiquetas de tus propias ofertas");
            }

            boolean success = offersService.addLabelToOffer(offerId, labelId);
            if (success) {
                return ResponseEntity.ok("Etiqueta agregada exitosamente");
            } else {
                return ResponseEntity.badRequest().body("Error al agregar etiqueta (máximo 5 etiquetas por oferta)");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al agregar etiqueta: " + e.getMessage());
        }
    }

    @DeleteMapping("/{offerId}/labels/{labelId}")
    public ResponseEntity<String> removeLabelFromOffer(@PathVariable Long offerId, @PathVariable Long labelId,
                                                      @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Verificar autorización
            if (!isAuthorizedToModifyOffer(offerId, authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes modificar las etiquetas de tus propias ofertas");
            }

            boolean success = offersService.removeLabelFromOffer(offerId, labelId);
            if (success) {
                return ResponseEntity.ok("Etiqueta removida exitosamente");
            } else {
                return ResponseEntity.badRequest().body("Error al remover etiqueta");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al remover etiqueta: " + e.getMessage());
        }
    }

    @GetMapping("/{offerId}/labels")
    public List<TechLabelsDTO> getOfferLabels(@PathVariable Long offerId) {
        return offersService.getOfferLabels(offerId);
    }

    @PutMapping("/{offerId}/labels")
    public ResponseEntity<String> updateOfferLabels(@PathVariable Long offerId, @RequestBody UpdateOfferLabelsDTO updateDto,
                                                   @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Verificar autorización
            if (!isAuthorizedToModifyOffer(offerId, authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes modificar las etiquetas de tus propias ofertas");
            }

            boolean success = offersService.updateOfferLabels(offerId, updateDto.getLabelIds());
            if (success) {
                return ResponseEntity.ok("Etiquetas actualizadas exitosamente");
            } else {
                return ResponseEntity.badRequest().body("Error al actualizar etiquetas (máximo 5 etiquetas por oferta)");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al actualizar etiquetas: " + e.getMessage());
        }
    }

    // Nuevo endpoint para obtener los tipos de trabajo disponibles
    @GetMapping("/work-types")
    public List<String> getWorkTypes() {
        return Arrays.stream(WorkType.values())
                .map(WorkType::getValue)
                .collect(java.util.stream.Collectors.toList());
    }

    // Método helper para verificar si una empresa puede modificar una oferta
    private boolean isAuthorizedToModifyOffer(Long offerId, String authHeader) {
        try {
            // Extraer el token del header
            String token = authHeader.substring(7); // Remover "Bearer "
            String role = jwtUtil.getRoleFromToken(token);
            Integer userCompanyId = jwtUtil.getCompanyIdFromToken(token);

            // Verificar que sea una empresa
            if (role == null || (!role.equals("role_company") && !role.equalsIgnoreCase("role_company"))) {
                return false;
            }

            // Verificar que el companyId esté en el token
            if (userCompanyId == null) {
                return false;
            }

            // Obtener la oferta para verificar propiedad
            OfferDTO offerCheck = new OfferDTO();
            offerCheck.setId(offerId);
            OfferDTO existingOffer = offersService.queryOffer(offerCheck);
            if (existingOffer == null) {
                return false;
            }

            // Verificar que la empresa sea dueña de la oferta
            return existingOffer.getCompanyId().equals(userCompanyId);

        } catch (Exception e) {
            return false;
        }
    }
}
