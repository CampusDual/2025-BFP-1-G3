
package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.JobApplicationDTO;
import java.util.List;

public interface IJobApplicationService {
    JobApplicationDTO queryJobApplication(JobApplicationDTO jobApplicationDTO);
    List<JobApplicationDTO> queryApplicationsByCandidate(Integer candidateId);
    List<JobApplicationDTO> queryApplicationsByJobOffer(Long jobOfferId);
    List<JobApplicationDTO> queryApplicationsByCompany(Long companyId);
    int applyToJobOffer(JobApplicationDTO jobApplicationDTO);
    int updateApplicationStatus(JobApplicationDTO jobApplicationDTO);
    boolean hasUserApplied(Long jobOfferId, Integer candidateId);
}