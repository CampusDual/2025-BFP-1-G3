package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dto.CandidateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper
public interface CandidateMapper {
    CandidateMapper INSTANCE = Mappers.getMapper(CandidateMapper.class);

    @Mapping(target = "techLabelIds", source = "techLabels", qualifiedByName = "techLabelsToIds")
    CandidateDTO toDTO(Candidate candidate);
    
    List<CandidateDTO> toDTOList(List<Candidate> candidates);
    
    @Mapping(target = "techLabels", ignore = true) // Se manejará manualmente en el servicio
    Candidate toEntity(CandidateDTO candidateDTO);

    @Named("techLabelsToIds")
    default List<Long> techLabelsToIds(Set<TechLabels> techLabels) {
        if (techLabels == null) return null;
        return techLabels.stream()
                .map(TechLabels::getId)
                .collect(Collectors.toList());
    }
}
