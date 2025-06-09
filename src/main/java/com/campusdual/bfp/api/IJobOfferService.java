package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.JobOfferDTO;
import java.util.List;

public interface IJobOfferService {
    JobOfferDTO queryJobOffer(JobOfferDTO jobOfferDTO);
    List<JobOfferDTO> queryAllJobOffers();
    List<JobOfferDTO> queryActiveJobOffers();
    List<JobOfferDTO> queryJobOffersByCompany(Long companyId);
    List<JobOfferDTO> searchJobOffers(String keyword);
    int insertJobOffer(JobOfferDTO jobOfferDTO);
    int updateJobOffer(JobOfferDTO jobOfferDTO);
    int deleteJobOffer(JobOfferDTO jobOfferDTO);
    int closeJobOffer(Long jobOfferId);
}