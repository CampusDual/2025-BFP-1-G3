package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.TechLabels;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TechLabelsDao extends JpaRepository<TechLabels, Long> {
}
