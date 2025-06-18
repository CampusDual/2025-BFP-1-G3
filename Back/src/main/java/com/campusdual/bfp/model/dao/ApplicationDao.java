package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationDao extends JpaRepository<Application, Integer> {
}
