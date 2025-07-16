package com.campusdual.bfp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:${user.home}/uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public String uploadProfilePhoto(MultipartFile file, int candidateId) throws IOException {
        // Validar tipo de archivo
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se permiten imágenes.");
        }

        // Validar tamaño del archivo
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo es demasiado grande. Máximo 5MB.");
        }

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir, "profile-photos");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = "candidate_" + candidateId + "_" + UUID.randomUUID().toString() + fileExtension;

        // Guardar archivo
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar la URL relativa
        return "/uploads/profile-photos/" + uniqueFilename;
    }

    public void deleteProfilePhoto(String photoUrl) {
        try {
            if (photoUrl != null && photoUrl.startsWith("/uploads/profile-photos/")) {
                String filename = photoUrl.substring(photoUrl.lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadDir, "profile-photos", filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            // Log del error, pero no lanzar excepción para no interrumpir otras operaciones
            System.err.println("Error eliminando archivo de foto de perfil: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
