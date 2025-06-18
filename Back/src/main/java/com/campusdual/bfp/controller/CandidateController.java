package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.ICandidateService;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/candidate")
public class CandidateController {

    @Autowired
    private ICandidateService candidateService;

    @GetMapping(value = "/testController")
    public String testCandidateController() {
        return "Candidate controller works!";
    }

    @PostMapping(value = "/get")
    public CandidateDTO queryCandidate(@RequestBody CandidateDTO candidateDTO) {
        return candidateService.queryCandidate(candidateDTO);
    }

    @GetMapping(value = "/getAll")
    public List<CandidateDTO> queryAllCandidates() {
        return candidateService.queryAllCandidates();
    }

    @PostMapping(value = "/add")
    public int addCandidate(@RequestBody CandidateDTO candidateDTO) {
        return candidateService.insertCandidate(candidateDTO);
    }

    @PutMapping(value = "/update")
    public int updateCandidate(@RequestBody CandidateDTO candidateDTO) {
        return candidateService.updateCandidate(candidateDTO);
    }

    @DeleteMapping(value = "/delete")
    public int deleteCandidate(@RequestBody CandidateDTO candidateDTO) {
        return candidateService.deleteCandidate(candidateDTO);
    }
}
