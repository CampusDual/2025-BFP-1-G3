package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.TechLabelsDTO;

import java.util.List;

public interface ITechLabelsService {
    TechLabelsDTO queryTechLabel(TechLabelsDTO techLabelsDTO);
    List<TechLabelsDTO> queryAllTechLabels();
    Long insertTechLabel(TechLabelsDTO techLabelsDTO);
    Long updateTechLabel(TechLabelsDTO techLabelsDTO);
    Long deleteTechLabel(TechLabelsDTO techLabelsDTO);
}
