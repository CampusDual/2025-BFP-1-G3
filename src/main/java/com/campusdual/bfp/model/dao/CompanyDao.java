
package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyDao extends JpaRepository<Company, Long> {
    Optional<Company> findByCif(String cif);
    Optional<Company> findByEmail(String email);
    boolean existsByCif(String cif);
    boolean existsByEmail(String email);
}