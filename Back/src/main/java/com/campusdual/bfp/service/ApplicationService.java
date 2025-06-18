package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.model.Application;
import com.campusdual.bfp.model.dao.ApplicationDao;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import com.campusdual.bfp.model.dto.dtomapper.ApplicationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        return ApplicationMapper.INSTANCE.toDTO(applicationDao.getReferenceById(Math.toIntExact(application.getId())));
    }

    @Override
    public List<ApplicationDTO> queryAllApplications() {
        return ApplicationMapper.INSTANCE.toDTOList(applicationDao.findAll());
    }

    @Override
    public Long insertApplication(ApplicationDTO applicationDTO) {
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
}
