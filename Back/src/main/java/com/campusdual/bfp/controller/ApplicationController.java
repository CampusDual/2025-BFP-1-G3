package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IApplicationService;
import com.campusdual.bfp.model.dto.ApplicationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private IApplicationService applicationService;

    @PostMapping(value = "/get")
    public ApplicationDTO queryApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.queryApplication(applicationDTO);
    }

    @GetMapping(value = "/getAll")
    public List<ApplicationDTO> queryAllApplications() {
        return applicationService.queryAllApplications();
    }

    @PostMapping(value = "/add")
    public long addApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.insertApplication(applicationDTO);
    }

    @PutMapping(value = "/update")
    public long updateApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.updateApplication(applicationDTO);
    }

    @DeleteMapping(value = "/delete")
    public long deleteApplication(@RequestBody ApplicationDTO applicationDTO) {
        return applicationService.deleteApplication(applicationDTO);
    }
}
