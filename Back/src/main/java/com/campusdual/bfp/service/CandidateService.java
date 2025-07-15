package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICandidateService;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.TechLabelsDao;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service("CandidateService")
@Lazy
public class CandidateService implements ICandidateService {
    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private TechLabelsDao techLabelsDao;

    /**
     * MÉTODO MODIFICADO: queryCandidate()
     * 
     * PROBLEMA ORIGINAL: Usaba getReferenceById() que causaba LazyInitializationException
     * SOLUCIÓN: Cambió a findById() que es más seguro y devuelve Optional
     */
    @Override
    public CandidateDTO queryCandidate(CandidateDTO candidateDTO) {
        // 1. Convertir DTO a entidad para obtener el ID
        Candidate candidate = CandidateMapper.INSTANCE.toEntity(candidateDTO);
        
        // 2. CORRECCIÓN: Usar findById() en lugar de getReferenceById()
        // findById() carga la entidad completa inmediatamente
        // getReferenceById() devuelve un proxy que puede causar errores lazy loading
        return candidateDao.findById(candidate.getId())
                .map(CandidateMapper.INSTANCE::toDTO)  // 3. Si existe, convertir a DTO
                .orElse(null);                         // 4. Si no existe, devolver null
    }

    @Override
    public List<CandidateDTO> queryAllCandidates() {
        return CandidateMapper.INSTANCE.toDTOList(candidateDao.findAll());
    }

    @Override
    public int insertCandidate(CandidateDTO candidateDTO) {
        Candidate candidate = CandidateMapper.INSTANCE.toEntity(candidateDTO);
        
        // Manejar las tech labels si están presentes
        if (candidateDTO.getTechLabelIds() != null && !candidateDTO.getTechLabelIds().isEmpty()) {
            Set<TechLabels> techLabels = new HashSet<>();
            for (Long techLabelId : candidateDTO.getTechLabelIds()) {
                techLabelsDao.findById(techLabelId).ifPresent(techLabels::add);
            }
            candidate.setTechLabels(techLabels);
        }
        
        candidateDao.saveAndFlush(candidate);
        return candidate.getId();
    }

    @Override
    public int updateCandidate(CandidateDTO candidateDTO) {
        // Obtener el candidato existente
        Candidate existingCandidate = candidateDao.findById(candidateDTO.getId()).orElse(null);
        if (existingCandidate == null) {
            throw new RuntimeException("Candidate not found with ID: " + candidateDTO.getId());
        }

        // Actualizar los campos del candidato
        existingCandidate.setName(candidateDTO.getName());
        existingCandidate.setSurname1(candidateDTO.getSurname1());
        existingCandidate.setSurname2(candidateDTO.getSurname2());
        existingCandidate.setPhone(candidateDTO.getPhone());
        existingCandidate.setEmail(candidateDTO.getEmail());
        existingCandidate.setLinkedin(candidateDTO.getLinkedin());
        
        // Actualizar los nuevos campos
        existingCandidate.setProfessionalTitle(candidateDTO.getProfessionalTitle());
        existingCandidate.setYearsExperience(candidateDTO.getYearsExperience());
        existingCandidate.setEmploymentStatus(candidateDTO.getEmploymentStatus());
        existingCandidate.setAvailability(candidateDTO.getAvailability());
        existingCandidate.setPreferredModality(candidateDTO.getPreferredModality());
        existingCandidate.setPresentation(candidateDTO.getPresentation());
        existingCandidate.setGithubProfile(candidateDTO.getGithubProfile());

        // Actualizar las tech labels
        if (candidateDTO.getTechLabelIds() != null) {
            Set<TechLabels> techLabels = new HashSet<>();
            for (Long techLabelId : candidateDTO.getTechLabelIds()) {
                techLabelsDao.findById(techLabelId).ifPresent(techLabels::add);
            }
            existingCandidate.setTechLabels(techLabels);
        }

        candidateDao.saveAndFlush(existingCandidate);
        return existingCandidate.getId();
    }

    @Override
    public int deleteCandidate(CandidateDTO candidateDTO) {
        int id = candidateDTO.getId();
        Candidate candidate = CandidateMapper.INSTANCE.toEntity(candidateDTO);
        candidateDao.delete(candidate);
        return id;
    }

    // Métodos para manejar foto de perfil
    public boolean updateProfilePhoto(int candidateId, String photoUrl, String filename, String contentType) {
        try {
            Candidate candidate = candidateDao.findById(candidateId).orElse(null);
            if (candidate != null) {
                // Eliminar foto anterior si existe
                String oldPhotoUrl = candidate.getProfilePhotoUrl();
                
                candidate.setProfilePhotoUrl(photoUrl);
                candidate.setProfilePhotoFilename(filename);
                candidate.setProfilePhotoContentType(contentType);
                candidateDao.saveAndFlush(candidate);
                
                // Eliminar archivo anterior del sistema de archivos si existe
                if (oldPhotoUrl != null && !oldPhotoUrl.equals(photoUrl)) {
                    // Aquí se podría llamar al FileUploadService para eliminar el archivo anterior
                }
                
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteProfilePhoto(int candidateId) {
        try {
            Candidate candidate = candidateDao.findById(candidateId).orElse(null);
            if (candidate != null) {
                String oldPhotoUrl = candidate.getProfilePhotoUrl();
                
                candidate.setProfilePhotoUrl(null);
                candidate.setProfilePhotoFilename(null);
                candidate.setProfilePhotoContentType(null);
                candidateDao.saveAndFlush(candidate);
                
                // Eliminar archivo del sistema de archivos si existe
                if (oldPhotoUrl != null) {
                    // Aquí se podría llamar al FileUploadService para eliminar el archivo
                }
                
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
