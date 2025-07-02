package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.auth.JWTUtil;
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

    @GetMapping("/getOffersByCompany/{companyId}")
    public List<OfferDTO> getOffersByCompanyId(@PathVariable int companyId) {
        return offersService.getOffersByCompanyId(companyId);
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
    public long updateOffer(@RequestBody OfferDTO offerDto) {
        return offersService.updateOffer(offerDto);
    }

    @DeleteMapping(value = "/delete")
    public long deleteOffer(@RequestBody OfferDTO offerDto) {
        return offersService.deleteOffer(offerDto);
    }

    @GetMapping("/{offerId}/candidates")
    public List<ApplicationDTO> getCandidatesByOfferId(@PathVariable int offerId) {
        return applicationService.getCandidatesByOfferId(offerId);
    }

    @PutMapping("/toggleActive/{id}")
    public ResponseEntity<String> toggleActive(@PathVariable Long id) {
        boolean updated = offersService.toggleActiveStatus(id);
        if (updated) {
            return ResponseEntity.ok("Estado 'active' cambiado con éxito.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Nuevos endpoints para manejar etiquetas de ofertas
    @PostMapping("/{offerId}/labels/{labelId}")
    public ResponseEntity<String> addLabelToOffer(@PathVariable Long offerId, @PathVariable Long labelId) {
        boolean success = offersService.addLabelToOffer(offerId, labelId);
        if (success) {
            return ResponseEntity.ok("Etiqueta agregada exitosamente");
        } else {
            return ResponseEntity.badRequest().body("Error al agregar etiqueta (máximo 5 etiquetas por oferta)");
        }
    }

    @DeleteMapping("/{offerId}/labels/{labelId}")
    public ResponseEntity<String> removeLabelFromOffer(@PathVariable Long offerId, @PathVariable Long labelId) {
        boolean success = offersService.removeLabelFromOffer(offerId, labelId);
        if (success) {
            return ResponseEntity.ok("Etiqueta removida exitosamente");
        } else {
            return ResponseEntity.badRequest().body("Error al remover etiqueta");
        }
    }

    @GetMapping("/{offerId}/labels")
    public List<TechLabelsDTO> getOfferLabels(@PathVariable Long offerId) {
        return offersService.getOfferLabels(offerId);
    }

    @PutMapping("/{offerId}/labels")
    public ResponseEntity<String> updateOfferLabels(@PathVariable Long offerId, @RequestBody UpdateOfferLabelsDTO updateDto) {
        boolean success = offersService.updateOfferLabels(offerId, updateDto.getLabelIds());
        if (success) {
            return ResponseEntity.ok("Etiquetas actualizadas exitosamente");
        } else {
            return ResponseEntity.badRequest().body("Error al actualizar etiquetas (máximo 5 etiquetas por oferta)");
        }
    }
}
