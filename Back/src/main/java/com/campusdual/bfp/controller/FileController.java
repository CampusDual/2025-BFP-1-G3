package com.campusdual.bfp.controller;

import com.campusdual.bfp.service.CandidateService;
import com.campusdual.bfp.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:4200")
public class FileController {

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private CandidateService candidateService;

    @PostMapping("/upload-profile-photo/{candidateId}")
    public ResponseEntity<?> uploadProfilePhoto(
            @PathVariable int candidateId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("No se ha seleccionado ningún archivo");
            }

            // Subir archivo
            String photoUrl = fileUploadService.uploadProfilePhoto(file, candidateId);

            // Actualizar candidato con la nueva URL de foto
            boolean updated = candidateService.updateProfilePhoto(candidateId, photoUrl, 
                    file.getOriginalFilename(), file.getContentType());

            if (updated) {
                Map<String, String> response = new HashMap<>();
                response.put("photoUrl", photoUrl);
                response.put("message", "Foto de perfil subida exitosamente");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Error al actualizar el perfil del candidato");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }

    @DeleteMapping("/delete-profile-photo/{candidateId}")
    public ResponseEntity<?> deleteProfilePhoto(@PathVariable int candidateId) {
        try {
            boolean deleted = candidateService.deleteProfilePhoto(candidateId);
            
            if (deleted) {
                return ResponseEntity.ok("Foto de perfil eliminada exitosamente");
            } else {
                return ResponseEntity.badRequest().body("Error al eliminar la foto de perfil");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }
}
