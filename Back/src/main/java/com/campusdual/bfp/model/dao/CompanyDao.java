package com.campusdual.bfp.model.dao;


import com.campusdual.bfp.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyDao extends JpaRepository<Company, Integer> {
}
