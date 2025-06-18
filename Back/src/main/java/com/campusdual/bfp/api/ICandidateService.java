package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.CompanyDTO;

import java.util.List;

public interface ICandidateService {
    CandidateDTO queryCandidate(CandidateDTO candidateDTO);
    List<CandidateDTO> queryAllCandidates();
    int insertCandidate(CandidateDTO candidateDTO);
    int updateCandidate(CandidateDTO candidateDTO);
    int deleteCandidate(CandidateDTO candidateDTO);
}
