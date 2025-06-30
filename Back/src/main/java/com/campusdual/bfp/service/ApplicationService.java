package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.model.Application;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.dao.ApplicationDao;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.dtomapper.ApplicationMapper;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("ApplicationService")
@Lazy
@Transactional

public class ApplicationService implements IApplicationService {
    @Autowired
    private ApplicationDao applicationDao;

    //Añadimos Candidate porque forma parte de la relación
    @Autowired
    private CandidateDao candidateDao;

    //Añadimos Offer porque forma parte de la relación
    @Autowired
    private OfferDao offerDao;

    @Override
    public ApplicationDTO queryApplication(ApplicationDTO applicationDTO) {
        Application application = ApplicationMapper.INSTANCE.toEntity(applicationDTO);
        return ApplicationMapper.INSTANCE.toDTO(applicationDao.getReferenceById(application.getId()));
    }

    @Override
    public List<ApplicationDTO> queryAllApplications() {
        return ApplicationMapper.INSTANCE.toDTOList(applicationDao.findAll());
    }

    @Override
    public Long insertApplication(ApplicationDTO applicationDTO) {
        int candidateId = applicationDTO.getId_candidate();
        Long offerId = applicationDTO.getId_offer().longValue();

        boolean alreadyExists = applicationDao.existsByCandidateIdAndOfferId(candidateId, offerId);

        if (alreadyExists) {
            throw new RuntimeException("El candidato ya está inscrito en esta oferta.");
        }

        Application application = ApplicationMapper.INSTANCE.toEntity(applicationDTO);
        applicationDao.saveAndFlush(application);
        return application.getId();
    }

    @Override
    public Long updateApplication(ApplicationDTO applicationDTO) {
        return insertApplication(applicationDTO);
    }

    @Override
    public Long deleteApplication(ApplicationDTO applicationDTO) {
        long id = applicationDTO.getId();
        Application application = ApplicationMapper.INSTANCE.toEntity(applicationDTO);
        applicationDao.delete(application);
        return id;
    }

    @Override
    public List<ApplicationDTO> getCandidatesByOfferId(int offerId) {
        // Buscar todas las aplicaciones para la oferta específica
        List<Application> applications = applicationDao.findByOfferId(Long.valueOf(offerId));

        return applications.stream().map(application -> {
            // Obtener el candidato desde la relación
            Candidate candidate = application.getCandidate();
            CandidateDTO candidateDTO = CandidateMapper.INSTANCE.toDTO(candidate);

            // Crear el ApplicationDTO que combina candidato y aplicación
            ApplicationDTO applicationDTO = new ApplicationDTO();
            applicationDTO.setId(application.getId());
            applicationDTO.setId_candidate(application.getCandidate().getId());
            applicationDTO.setId_offer(application.getOffer().getId().intValue());
            applicationDTO.setCandidate(candidateDTO);

            return applicationDTO;
        }).collect(Collectors.toList());
    }
}
