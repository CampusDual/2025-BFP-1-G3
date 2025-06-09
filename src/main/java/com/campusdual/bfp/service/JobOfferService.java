package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IJobOfferService;
import com.campusdual.bfp.model.JobOffer;
import com.campusdual.bfp.model.dto.JobOfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.JobOfferMapper;
import com.campusdual.bfp.model.dao.JobOfferDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobOfferService implements IJobOfferService {

    @Autowired
    private JobOfferDao jobOfferDao;

    @Override
    public JobOfferDTO queryJobOffer(JobOfferDTO jobOfferDTO) {
        Optional<JobOffer> jobOfferOpt = jobOfferDao.findById(jobOfferDTO.getId());
        
        if (jobOfferOpt.isPresent()) {
            return JobOfferMapper.INSTANCE.toDto(jobOfferOpt.get());
        }
        return null;
    }

    @Override
    public List<JobOfferDTO> queryAllJobOffers() {
        List<JobOffer> jobOffers = jobOfferDao.findAll();
        return JobOfferMapper.INSTANCE.toDtoList(jobOffers);
    }

    @Override
    public List<JobOfferDTO> queryActiveJobOffers() {
        List<JobOffer> activeJobOffers = jobOfferDao.findByActiveTrue();
        return JobOfferMapper.INSTANCE.toDtoList(activeJobOffers);
    }

    @Override
    public List<JobOfferDTO> queryJobOffersByCompany(Long companyId) {
        List<JobOffer> jobOffers = jobOfferDao.findByCompanyId(companyId);
        return JobOfferMapper.INSTANCE.toDtoList(jobOffers);
    }

    @Override
    public List<JobOfferDTO> searchJobOffers(String keyword) {
        List<JobOffer> jobOffers = jobOfferDao.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            keyword, keyword);
        return JobOfferMapper.INSTANCE.toDtoList(jobOffers);
    }

    @Override
    public int insertJobOffer(JobOfferDTO jobOfferDTO) {
        JobOffer jobOffer = JobOfferMapper.INSTANCE.toEntity(jobOfferDTO);
        JobOffer saved = jobOfferDao.save(jobOffer);
        return saved != null ? 1 : 0;
    }

    @Override
    public int updateJobOffer(JobOfferDTO jobOfferDTO) {
        if (jobOfferDao.existsById(jobOfferDTO.getId())) {
            JobOffer jobOffer = JobOfferMapper.INSTANCE.toEntity(jobOfferDTO);
            jobOfferDao.save(jobOffer);
            return 1;
        }
        return 0;
    }

    @Override
    public int deleteJobOffer(JobOfferDTO jobOfferDTO) {
        if (jobOfferDao.existsById(jobOfferDTO.getId())) {
            jobOfferDao.deleteById(jobOfferDTO.getId());
            return 1;
        }
        return 0;
    }

    @Override
    public int closeJobOffer(Long jobOfferId) {
        Optional<JobOffer> jobOfferOpt = jobOfferDao.findById(jobOfferId);
        
        if (jobOfferOpt.isPresent()) {
            JobOffer jobOffer = jobOfferOpt.get();
            // Cambiar el estado en lugar de 'active'
            jobOffer.setStatus(JobOffer.JobOfferStatus.CLOSED);
            jobOfferDao.save(jobOffer);
            return 1;
        }
        return 0;
    }
}