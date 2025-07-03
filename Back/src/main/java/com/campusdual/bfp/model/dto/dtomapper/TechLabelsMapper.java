package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface TechLabelsMapper {
    TechLabelsMapper INSTANCE = Mappers.getMapper(TechLabelsMapper.class);

    TechLabelsDTO toDTO(TechLabels techLabels);
    List<TechLabelsDTO> toDTOList(List<TechLabels> techLabels);
    TechLabels toEntity(TechLabelsDTO techLabelsDTO);
}
