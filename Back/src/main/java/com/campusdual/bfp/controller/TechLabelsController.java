package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.ITechLabelsService;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tech-labels")
public class TechLabelsController {
    
    @Autowired
    private ITechLabelsService techLabelsService;
    
    @PostMapping(value = "/get")
    public TechLabelsDTO queryTechLabel(@RequestBody TechLabelsDTO techLabelsDTO) {
        return techLabelsService.queryTechLabel(techLabelsDTO);
    }
    
    @GetMapping(value = "/getAll")
    public List<TechLabelsDTO> queryAllTechLabels() {
        return techLabelsService.queryAllTechLabels();
    }
    
    @PostMapping(value = "/add")
    public ResponseEntity<Long> insertTechLabel(@RequestBody TechLabelsDTO techLabelsDTO) {
        Long id = techLabelsService.insertTechLabel(techLabelsDTO);
        if (id != null) {
            return ResponseEntity.ok(id);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PostMapping(value = "/update")
    public ResponseEntity<Long> updateTechLabel(@RequestBody TechLabelsDTO techLabelsDTO) {
        Long id = techLabelsService.updateTechLabel(techLabelsDTO);
        if (id != null) {
            return ResponseEntity.ok(id);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PostMapping(value = "/delete")
    public ResponseEntity<Long> deleteTechLabel(@RequestBody TechLabelsDTO techLabelsDTO) {
        Long id = techLabelsService.deleteTechLabel(techLabelsDTO);
        if (id != null) {
            return ResponseEntity.ok(id);
        }
        return ResponseEntity.badRequest().build();
    }
}
