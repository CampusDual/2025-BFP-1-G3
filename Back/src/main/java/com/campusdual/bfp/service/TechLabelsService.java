package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ITechLabelsService;
import com.campusdual.bfp.model.TechLabels;
import com.campusdual.bfp.model.dao.TechLabelsDao;
import com.campusdual.bfp.model.dto.TechLabelsDTO;
import com.campusdual.bfp.model.dto.dtomapper.TechLabelsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service("TechLabelsService")
@Lazy
@Transactional
public class TechLabelsService implements ITechLabelsService {
    
    @Autowired
    private TechLabelsDao techLabelsDao;

    @Override
    public TechLabelsDTO queryTechLabel(TechLabelsDTO techLabelsDTO) {
        Long id = techLabelsDTO.getId();
        Optional<TechLabels> techLabel = techLabelsDao.findById(id);
        return techLabel.map(TechLabelsMapper.INSTANCE::toDTO).orElse(null);
    }

    @Override
    public List<TechLabelsDTO> queryAllTechLabels() {
        List<TechLabels> techLabels = techLabelsDao.findAll();
        return TechLabelsMapper.INSTANCE.toDTOList(techLabels);
    }

    @Override
    public Long insertTechLabel(TechLabelsDTO techLabelsDTO) {
        TechLabels techLabel = TechLabelsMapper.INSTANCE.toEntity(techLabelsDTO);
        TechLabels savedTechLabel = techLabelsDao.save(techLabel);
        return savedTechLabel.getId();
    }

    @Override
    public Long updateTechLabel(TechLabelsDTO techLabelsDTO) {
        if (techLabelsDTO.getId() == 0 || !techLabelsDao.existsById(techLabelsDTO.getId())) {
            return null;
        }
        TechLabels techLabel = TechLabelsMapper.INSTANCE.toEntity(techLabelsDTO);
        TechLabels updatedTechLabel = techLabelsDao.save(techLabel);
        return updatedTechLabel.getId();
    }

    @Override
    public Long deleteTechLabel(TechLabelsDTO techLabelsDTO) {
        Long id = techLabelsDTO.getId();
        if (techLabelsDao.existsById(id)) {
            techLabelsDao.deleteById(id);
            return id;
        }
        return null;
    }
}
