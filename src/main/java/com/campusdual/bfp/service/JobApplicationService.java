package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IJobApplicationService;
import com.campusdual.bfp.model.JobApplication;
import com.campusdual.bfp.model.JobOffer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.JobApplicationDao;
import com.campusdual.bfp.model.dao.JobOfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dto.JobApplicationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("JobApplicationService")
@Lazy
public class JobApplicationService implements IJobApplicationService {

    @Autowired
    private JobApplicationDao jobApplicationDao;

    @Autowired
    private JobOfferDao jobOfferDao;

    @Autowired
    private UserDao userDao;

    @Override
    public JobApplicationDTO queryJobApplication(JobApplicationDTO jobApplicationDTO) {
        Optional<JobApplication> application = jobApplicationDao.findById(jobApplicationDTO.getId());
        return application.map(this::entityToDto).orElse(null);
    }

    @Override
    public List<JobApplicationDTO> queryApplicationsByCandidate(Integer candidateId) {
        List<JobApplication> applications = jobApplicationDao.findApplicationsByCandidateId(candidateId);
        return applications.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobApplicationDTO> queryApplicationsByJobOffer(Long jobOfferId) {
        Optional<JobOffer> jobOffer = jobOfferDao.findById(jobOfferId);
        if (jobOffer.isPresent()) {
            List<JobApplication> applications = jobApplicationDao.findByJobOffer(jobOffer.get());
            return applications.stream()
                    .map(this::entityToDto)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Override
    public List<JobApplicationDTO> queryApplicationsByCompany(Long companyId) {
        List<JobApplication> applications = jobApplicationDao.findApplicationsByCompanyId(companyId);
        return applications.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public int applyToJobOffer(JobApplicationDTO jobApplicationDTO) {
        Optional<JobOffer> jobOffer = jobOfferDao.findById(jobApplicationDTO.getJobOfferId());
        Optional<User> candidate = userDao.findById(jobApplicationDTO.getCandidateId().longValue());

        if (jobOffer.isPresent() && candidate.isPresent()) {
            // Verificar si ya aplicó
            if (jobApplicationDao.existsByJobOfferAndCandidate(jobOffer.get(), candidate.get())) {
                return -1; // Ya aplicó
            }

            JobApplication application = new JobApplication();
            application.setJobOffer(jobOffer.get());
            application.setCandidate(candidate.get());
            application.setCoverLetter(jobApplicationDTO.getCoverLetter());
            
            JobApplication savedApplication = jobApplicationDao.save(application);
            return savedApplication.getId() != null ? 1 : 0;
        }
        return 0;
    }

    @Override
    public int updateApplicationStatus(JobApplicationDTO jobApplicationDTO) {
        Optional<JobApplication> existingApplication = jobApplicationDao.findById(jobApplicationDTO.getId());
        if (existingApplication.isPresent()) {
            JobApplication application = existingApplication.get();
            application.setStatus(jobApplicationDTO.getStatus());
            jobApplicationDao.save(application);
            return 1;
        }
        return 0;
    }

    @Override
    public boolean hasUserApplied(Long jobOfferId, Integer candidateId) {
        Optional<JobOffer> jobOffer = jobOfferDao.findById(jobOfferId);
        Optional<User> candidate = userDao.findById(candidateId.longValue());
        
        if (jobOffer.isPresent() && candidate.isPresent()) {
            return jobApplicationDao.existsByJobOfferAndCandidate(jobOffer.get(), candidate.get());
        }
        return false;
    }

    // Método de conversión
    private JobApplicationDTO entityToDto(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setJobOfferId(application.getJobOffer().getId());
        dto.setJobOfferTitle(application.getJobOffer().getTitle());
        dto.setCompanyName(application.getJobOffer().getCompany().getName());
        dto.setCandidateId(application.getCandidate().getId());
        dto.setCandidateName(application.getCandidate().getName() + " " + 
                            application.getCandidate().getSurname1());
        // Aquí podrías obtener el email del candidato si lo necesitas
        dto.setStatus(application.getStatus());
        dto.setCoverLetter(application.getCoverLetter());
        dto.setAppliedAt(application.getAppliedAt());
        return dto;
    }
}