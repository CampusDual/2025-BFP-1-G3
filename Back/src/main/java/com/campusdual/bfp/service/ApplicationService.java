package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.model.Application;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.ApplicationDao;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
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

    //Añadimos UserDao para seguridad
    @Autowired
    private UserDao userDao;

    @Autowired
    private UserService userService;

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
    public Long insertSecureApplication(ApplicationDTO applicationDTO, String username) {
        try {
            // Buscar el usuario por username
            User user = userDao.findByLogin(username);
            if (user == null) {
                throw new RuntimeException("Usuario no encontrado");
            }

            // Obtener el candidato desde la relación User -> Candidate
            Candidate candidate = user.getCandidate();
            if (candidate == null) {
                // Si no hay relación User-Candidate directa, buscar por email
                candidate = candidateDao.findByEmail(username);
                if (candidate == null) {
                    throw new RuntimeException("Candidato no encontrado para este usuario");
                }
            }

            Long offerId = applicationDTO.getId_offer().longValue();
            int candidateId = candidate.getId();

            // Verificar si ya está aplicado
            boolean alreadyExists = applicationDao.existsByCandidateIdAndOfferId(candidateId, offerId);
            if (alreadyExists) {
                throw new RuntimeException("Ya has aplicado a esta oferta anteriormente");
            }

            // Crear la aplicación con el candidateId seguro obtenido del token
            Application application = new Application();
            application.setCandidate(candidate);
            application.setOffer(offerDao.getReferenceById(offerId));

            applicationDao.saveAndFlush(application);
            return application.getId();
            
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la aplicación: " + e.getMessage());
        }
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
