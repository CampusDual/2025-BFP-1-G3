package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICandidateService;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("CandidateService")
@Lazy
public class CandidateService implements ICandidateService {
    @Autowired
    private CandidateDao candidateDao;

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
        candidateDao.saveAndFlush(candidate);
        return candidate.getId();
    }

    @Override
    public int updateCandidate(CandidateDTO candidateDTO) {
        return insertCandidate(candidateDTO);
    }

    @Override
    public int deleteCandidate(CandidateDTO candidateDTO) {
        int id = candidateDTO.getId();
        Candidate candidate = CandidateMapper.INSTANCE.toEntity(candidateDTO);
        candidateDao.delete(candidate);
        return id;
    }
}
