package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.model.Application;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.ApplicationDao;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import com.campusdual.bfp.model.dto.ApplicationSummaryDTO;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.ApplicationMapper;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("ApplicationService")
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

    /**
     * MÉTODO SEGURO AGREGADO: insertSecureApplication()
     * <p>
     * DIFERENCIA CON insertApplication():
     * - insertApplication() confiaba en el candidateId enviado desde el frontend (VULNERABLE)
     * - insertSecureApplication() obtiene el candidateId del usuario autenticado (SEGURO)
     */
    @Override
    public Long insertSecureApplication(ApplicationDTO applicationDTO, String username) {
        try {
            // 1. Buscar el usuario en la BD usando el username del token JWT
            User user = userDao.findByLogin(username);
            if (user == null) {
                throw new RuntimeException("Usuario no encontrado");
            }

            // 2. PASO CRÍTICO: Obtener el candidato real del usuario autenticado
            Candidate candidate = user.getCandidate();
            if (candidate == null) {
                // 3. FALLBACK: Si no hay relación User->Candidate directa, buscar por email
                // Esto es para casos donde el login del usuario es el email del candidato
                candidate = candidateDao.findByEmail(username);
                if (candidate == null) {
                    throw new RuntimeException("Candidato no encontrado para este usuario");
                }
            }

            // 4. Obtener los IDs necesarios para crear la aplicación
            Long offerId = applicationDTO.getId_offer().longValue();
            int candidateId = candidate.getId(); // ESTE ES EL ID SEGURO, NO del frontend

            // 5. VALIDACIÓN: Verificar si ya aplicó a esta oferta
            boolean alreadyExists = applicationDao.existsByCandidateIdAndOfferId(candidateId, offerId);
            if (alreadyExists) {
                throw new RuntimeException("Ya has aplicado a esta oferta anteriormente");
            }

            // 6. Crear la aplicación con los datos seguros
            Application application = new Application();
            application.setCandidate(candidate);           // Candidato del usuario autenticado
            application.setOffer(offerDao.getReferenceById(offerId)); // Oferta del request

            // 7. Guardar en BD y devolver ID
            applicationDao.saveAndFlush(application);
            return application.getId();

        } catch (Exception e) {
            // 8. Manejo de errores con mensaje descriptivo
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

    public int toggleActiveStatus(Long id, ApplicationDTO applicationDTO) {
        Optional<Application> optionalApplication = applicationDao.findById(id);
        int state = applicationDTO.getState();
        if (optionalApplication.isPresent()) {
            Application application = optionalApplication.get();
            application.setState(state);
            applicationDao.saveAndFlush(application);
            return application.getState();
        }
        return -1;
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
            applicationDTO.setState(application.getState());

            return applicationDTO;
        }).collect(Collectors.toList());
    }

    @Override
    public List<ApplicationSummaryDTO> queryAplicationsByCandidate(String login) {
        // 1. Buscar el usuario por login
        User user = userDao.findByLogin(login);
        if (user == null) {
            return new ArrayList<>();
        }

        // 2. Obtener el candidato del usuario
        Candidate candidate = user.getCandidate();
        if (candidate == null) {
            // Fallback: buscar por email si no hay relación directa
            candidate = candidateDao.findByEmail(login);
            if (candidate == null) {
                return new ArrayList<>();
            }
        }

        // 3. Buscar aplicaciones por candidateId
        List<Application> applications = applicationDao.findByCandidateId(candidate.getId());

        // 4. Convertir a ApplicationSummaryDTO
        return applications.stream().map(application -> {
            ApplicationSummaryDTO dto = new ApplicationSummaryDTO();
            dto.setId(application.getId());
            dto.setState(application.getState());

            Offer offer = application.getOffer();
            OfferDTO offerDTO = OfferMapper.INSTANCE.toDTO(offer);
            dto.setOffer(offerDTO);

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public boolean checkApplicationExists(Integer candidateId, Long offerId) {
        // Buscar si ya existe una aplicación para este candidato y oferta
        List<Application> existingApplications = applicationDao.findByCandidateId(candidateId);

        return existingApplications.stream()
                .anyMatch(application -> application.getOffer().getId().equals(offerId));
    }
}
