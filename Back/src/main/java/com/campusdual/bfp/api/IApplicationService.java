package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.ApplicationDTO;

import java.util.List;

public interface IApplicationService {
    ApplicationDTO queryApplication(ApplicationDTO applicationDTO);
    List<ApplicationDTO> queryAllApplications();
    Long insertApplication(ApplicationDTO applicationDTO);
    Long insertSecureApplication(ApplicationDTO applicationDTO, String username);
    Long updateApplication(ApplicationDTO applicationDTO);
    Long deleteApplication(ApplicationDTO applicationDTO);
    List<ApplicationDTO> getCandidatesByOfferId(int offerId);
}
